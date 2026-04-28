# area-do-autor

## Purpose

A área do autor (`/casa`) é o painel autenticado de quem mantém uma niusleter no Bemte.li. Por aqui o autor edita os dados da própria niusleter, vê (somente leitura) os textos publicados e os inscritos, e abre o editor em `/criar` para escrever um novo texto. A criação de conta e de niusleter continua restrita ao painel do PocketBase — a área do autor é uma camada de "casa" sobre dados que já existem.

## Requirements

### Requirement: `/casa` and `/criar` are gated behind authentication
The system SHALL require an authenticated session to view any `/casa/*` route or `/criar`. Unauthenticated visitors SHALL be redirected to `/entrar?redirect=<encoded-path>` by Next.js middleware before any page HTML is rendered.

The middleware SHALL build a server-side PocketBase client from the request cookies (`createServerClient(cookies())`), check `pb.authStore.isValid`, and respond with a 30x redirect when the session is missing or invalid. A small client-side fallback in the autor route layout SHALL also redirect if the in-memory auth store goes invalid mid-session (e.g., after a failed `authRefresh`), so a stale cookie cannot leak protected UI.

#### Scenario: Unauthenticated visitor opens `/casa`
- **WHEN** a visitor with no `pb_auth` cookie (or with a cookie whose token is expired/malformed) navigates to `/casa`
- **THEN** Next.js middleware responds with a redirect to `/entrar?redirect=%2Fcasa` and no `/casa` HTML is sent to the browser

#### Scenario: Unauthenticated visitor opens `/criar`
- **WHEN** a visitor with no valid `pb_auth` cookie navigates to `/criar`
- **THEN** Next.js middleware responds with a redirect to `/entrar?redirect=%2Fcriar`

#### Scenario: Authenticated visitor opens `/casa`
- **WHEN** an autor with a valid `pb_auth` cookie navigates to `/casa`
- **THEN** middleware lets the request through and the dashboard renders

#### Scenario: Session goes invalid while the user is on `/casa`
- **WHEN** the autor is already on `/casa` and a client-side `authRefresh` fails (token revoked or expired), clearing `pb.authStore`
- **THEN** the autor route layout sees `useUser()` return `null`, the `pb_auth` cookie is cleared by the `onChange` handler, and the layout calls `router.replace('/entrar?redirect=%2Fcasa')` so the autor is not stranded on a broken authenticated page

### Requirement: `/casa` dashboard
The system SHALL render a `/casa` page that:
- Greets the autor by their niusleter name (when one is associated with their account).
- Provides links to `/casa/editar`, `/casa/textos`, `/casa/inscritos`, and `/criar`.
- Provides a "Sair" (logout) action.
- Uses Bemte.li brand tokens (`bg-marfim`, `text-sombra`, etc.) and Cousine typography.

#### Scenario: Autor with a niusleter
- **WHEN** an authenticated autor whose `usuarios` record is referenced by exactly one `niusleteres.usuario` opens `/casa`
- **THEN** the page shows the niusleter's `nome` and four navigation links (Editar niusleter / Ver textos / Ver inscritos / Criar texto) plus a logout button

#### Scenario: Autor without a niusleter
- **WHEN** an authenticated user has no row in `niusleteres` referencing their `id`
- **THEN** the page shows a friendly Portuguese message explaining that no niusleter is associated with the account, plus a logout button — and does not link to the sub-pages
- **AND** the system does not crash or render a partial/broken dashboard

### Requirement: `/casa/editar` lets the autor edit their niusleter
The system SHALL provide a `/casa/editar` page that loads the niusleter where `usuario = @request.auth.id` and lets the autor edit `nome`, `descricao` (HTML editor), `display_mode`, `foto_3x4` (file upload), `foto_horizontal` (file upload), and `caminho`.

The form SHALL:
- Validate `caminho` against the pattern `^[a-z0-9-]+$` client-side (and rely on PocketBase server-side validation as the authoritative check).
- Show a permanent warning next to the `caminho` field stating that changing it will break existing public URLs.
- Show a confirmation modal on submit when `caminho` changed from its loaded value, asking the autor to confirm before saving.
- Persist via `pb.collection("niusleteres").update(id, ...)` against the rule `usuario = @request.auth.id`.
- Expose a control to clear an existing photo (set the file field to empty) without uploading a replacement.

#### Scenario: Edit name and description without changing the slug
- **WHEN** the autor changes only `nome` and `descricao` and clicks "Salvar"
- **THEN** the system updates the niusleter record in PocketBase and shows a success indicator without prompting any modal

#### Scenario: Edit `caminho` (slug change)
- **WHEN** the autor changes `caminho` and clicks "Salvar"
- **THEN** the system shows a confirmation modal warning that public links will break
- **AND** if the autor confirms, the system persists the new `caminho`
- **AND** if the autor cancels, the form retains the new value but does not save

#### Scenario: Invalid `caminho` pattern
- **WHEN** the autor types `caminho` that does not match `^[a-z0-9-]+$` (e.g. uppercase, spaces, or accents)
- **THEN** the form blocks submission and shows an inline Portuguese error explaining the allowed characters

#### Scenario: Replacing the niusleter photo
- **WHEN** the autor selects a new image file for `foto_3x4` (or `foto_horizontal`) and saves
- **THEN** the system uploads the file to the `niusleteres` collection and the saved record references the new file name

#### Scenario: Switching display mode
- **WHEN** the autor changes `display_mode` (e.g. `title_only` → `title_with_3x4_photo` → `title_image_horizontal`) and saves
- **THEN** the system persists the new mode and the public navbar reflects the choice (title only, title with round 3x4 avatar, or horizontal image)

#### Scenario: Clearing a niusleter photo
- **WHEN** the autor clicks "Remover foto" for `foto_3x4` or `foto_horizontal` and saves
- **THEN** the system submits an empty value for that field, PocketBase deletes the file, and subsequent reads return no photo

### Requirement: `/casa/textos` lists the autor's textos read-only
The system SHALL provide a `/casa/textos` page that lists every `textos` row whose `niusleter.usuario = @request.auth.id`, showing for each: `titulo`, `caminho`, `enviado` date, and `created` date, sorted by `-created`.

The page SHALL be read-only in this change: no edit, delete, or reorder controls.

#### Scenario: Autor with several textos
- **WHEN** the autor opens `/casa/textos`
- **THEN** the page renders one row per texto belonging to their niusleter, ordered most-recent-first, displaying titulo / caminho / enviado / created

#### Scenario: Autor with no textos
- **WHEN** the autor's niusleter has zero `textos` rows
- **THEN** the page shows an empty state with a Portuguese message and a link to `/criar`

#### Scenario: Visiting another autor's textos
- **WHEN** any authenticated autor opens `/casa/textos`
- **THEN** the page only shows textos that belong to their own niusleter — never another autor's, even if a request directly attempts a wider filter, because PocketBase rules enforce ownership

### Requirement: `/casa/inscritos` lists the autor's inscritos read-only
The system SHALL provide a `/casa/inscritos` page that lists every `inscritos` row whose `niusleter.usuario = @request.auth.id`, showing for each: `email`, `created` date, and a status flag derived from `verificado` and `desinscrito`.

The page SHALL be read-only in this change: no add, remove, or export controls.

#### Scenario: Autor with several inscritos
- **WHEN** the autor opens `/casa/inscritos`
- **THEN** the page renders the inscritos belonging to their niusleter, including verified / unsubscribed / pending status derived from the `verificado` and `desinscrito` columns

#### Scenario: Autor with zero inscritos
- **WHEN** the autor's niusleter has no `inscritos`
- **THEN** the page shows an empty state in Portuguese explaining how subscriptions arrive (without exposing internal implementation details)

#### Scenario: Inscritos privacy
- **WHEN** anyone unauthenticated requests the `inscritos` collection
- **THEN** PocketBase rejects the request because `inscritos.listRule` requires `niusleter.usuario = @request.auth.id`

### Requirement: `/criar` is the new path for the text editor
The system SHALL host the existing text editor at `/criar` instead of `/criar-texto`.

This change is a route move: the editor UI is identical; only the URL changes. `/criar-texto` SHALL no longer be served by the app.

#### Scenario: Visiting `/criar` while authenticated
- **WHEN** an authenticated autor opens `/criar`
- **THEN** the existing editor renders (title field, body editor, rodape editor, autosave to localStorage, Salvar/Publicar/Visualizar controls)

#### Scenario: Visiting `/criar-texto`
- **WHEN** any visitor opens `/criar-texto`
- **THEN** the app does not render the editor; the route returns Next.js's standard 404 page

#### Scenario: Internal references updated
- **WHEN** the codebase is searched for `/criar-texto` after this change ships
- **THEN** there are no production references left (links in admin/dev pages, navigation, or copy point to `/criar`)

### Requirement: `niusleteres` permissions allow the owner to update
The system SHALL configure `niusleteres` collection rules so that:
- `listRule = ""` (public listing)
- `viewRule = ""` (public read)
- `createRule = null` (admin only)
- `updateRule = "usuario = @request.auth.id"`
- `deleteRule = null` (admin only)

#### Scenario: Owner updates their niusleter
- **WHEN** an authenticated autor calls `pb.collection("niusleteres").update(theirNiusleterId, { nome: "Novo nome" })`
- **THEN** PocketBase accepts the update because the rule `usuario = @request.auth.id` evaluates to true

#### Scenario: Different autor attempts to update someone else's niusleter
- **WHEN** an authenticated autor calls `update` on a niusleter whose `usuario` does not match their `@request.auth.id`
- **THEN** PocketBase rejects the request with a permission error

### Requirement: `textos` permissions allow the niusleter owner to manage their textos
The system SHALL configure `textos` collection rules so that:
- `listRule = ""` (public listing — unchanged)
- `viewRule = ""` (public read — unchanged)
- `createRule = "niusleter.usuario = @request.auth.id"`
- `updateRule = "niusleter.usuario = @request.auth.id"`
- `deleteRule = "niusleter.usuario = @request.auth.id"`

#### Scenario: Owner creates a texto under their niusleter
- **WHEN** an authenticated autor calls `pb.collection("textos").create({ niusleter: theirNiusleterId, titulo: "...", corpo: "...", caminho: "..." })`
- **THEN** PocketBase accepts the create because `niusleter.usuario = @request.auth.id`

#### Scenario: Owner attempts to create a texto under another niusleter
- **WHEN** an authenticated autor calls `create` with a `niusleter` field referencing a niusleter they do not own
- **THEN** PocketBase rejects the request with a permission error

#### Scenario: Public reading is unaffected
- **WHEN** an unauthenticated visitor reads a texto via the public path
- **THEN** PocketBase still serves it because `listRule` and `viewRule` remain `""`

### Requirement: `inscritos` permissions allow the niusleter owner to read their inscritos
The system SHALL configure `inscritos` collection rules so that:
- `listRule = "niusleter.usuario = @request.auth.id"`
- `viewRule = "niusleter.usuario = @request.auth.id"`
- `createRule = null` (subscription pipeline unchanged in this change)
- `updateRule = null`
- `deleteRule = null`

#### Scenario: Owner lists their inscritos
- **WHEN** an authenticated autor calls `pb.collection("inscritos").getFullList({ filter: 'niusleter="..."' })` for their own niusleter
- **THEN** PocketBase returns the matching inscritos rows

#### Scenario: Anonymous tries to list inscritos
- **WHEN** an unauthenticated visitor calls `pb.collection("inscritos").getList(...)`
- **THEN** PocketBase rejects the request because `listRule` requires authentication

#### Scenario: Owner cannot delete or modify inscritos
- **WHEN** an authenticated autor calls `update` or `delete` on an inscrito of their own niusleter
- **THEN** PocketBase rejects the request — those mutations remain admin-only in this change

### Requirement: Documented schema reflects new permissions
The system SHALL keep `docs/DATABASE_SCHEMA.md` accurate: the permissions sections for `niusleteres`, `textos`, and `inscritos` SHALL describe the rules above.

#### Scenario: Schema doc audit
- **WHEN** a contributor reads `docs/DATABASE_SCHEMA.md` after this change ships
- **THEN** the permissions for `niusleteres`, `textos`, and `inscritos` match the rules registered in the migration that ships with this change
