## Why

Bemte.li does not have a way for an autor to log in and manage their own niusleter — every change has to go through the PocketBase admin UI. We want a simple, on-brand area do autor (`/casa`) where an authenticated autor can edit their niusleter, see who's inscrito, see the textos they've written, and reach the editor at `/criar`. Account creation stays admin-only for now.

## What Changes

- New login screen at `/entrar` (email + password, no signup).
  - On success, redirects to `/casa`.
  - Already-logged-in users hitting `/entrar` are redirected to `/casa`.
- New `/casa` dashboard with links to the sub-pages below and a logout action.
- New `/casa/editar` page to edit the autor's niusleter (`nome`, `descricao`, `display_mode`, `foto_3x4`, `foto_horizontal`, `caminho`). Editing `caminho` shows a clear warning that public URLs to existing textos will break.
- New `/casa/inscritos` read-only listing of the autor's inscritos.
- New `/casa/textos` read-only listing of the autor's textos.
- **BREAKING:** rename route `/criar-texto` → `/criar`. The `/criar-texto` URL goes away (the existing editor UI moves as-is). Internal links updated.
- All `/casa/*` and `/criar` routes are gated by Next.js middleware: the PocketBase auth state is mirrored to a `pb_auth` cookie on the client (via `pb.authStore.exportToCookie`) and read server-side via `pb.authStore.loadFromCookie`. Unauthenticated visitors are redirected to `/entrar?redirect=<path>` before any page HTML is rendered. The cookie is `httpOnly: false` (the SDK needs to read/refresh it from the browser); PocketBase API rules remain the real security boundary.
- **BREAKING (DB):** PocketBase rules are updated so an autor can manage their own niusleter and the records that belong to it:
  - `niusleteres`: an autor can `view`/`update` their own niusleter (`usuario = @request.auth.id`). `create`/`delete` stay admin-only (one niusleter per autor today).
  - `textos`: an autor can `list`/`view`/`create`/`update`/`delete` textos that belong to their niusleter.
  - `inscritos`: an autor can `list`/`view` inscritos of their niusleter. `create`/`update`/`delete` stay admin-only (subscription flow is a separate concern).
- Out of scope, even though they will become possible later thanks to the rule changes:
  - Wiring up `Salvar`/`Publicar` in `/criar` to actually persist textos via the API.
  - Editing or deleting textos from `/casa/textos`.
  - Removing or exporting inscritos from `/casa/inscritos`.
  - Any account-creation, password-reset, or "esqueci minha senha" flow.

## Capabilities

### New Capabilities
- `autenticacao`: login flow, session refresh, logout, redirect of authenticated users away from `/entrar`.
- `area-do-autor`: the `/casa` shell, the niusleter edit page, the read-only listings of textos and inscritos, the `/criar` route.

### Modified Capabilities
<!-- None — this is the first OpenSpec change in the repo, no existing specs to amend. -->

## Impact

- **Frontend** (`frontend/`):
  - Refactor `frontend/src/lib/pocketbase.ts` into the community-standard pattern: `createBrowserClient()` (singleton in the browser, hooks `pb.authStore.onChange` to mirror state into the `pb_auth` cookie via `exportToCookie({ httpOnly: false })`) + `createServerClient(cookieStore?)` (per-request, hydrates from `pb_auth` via `loadFromCookie`). Existing public helpers (`getTextosByNiusleter`, etc.) keep working through these factories.
  - Wire `UserContextProvider` (already present in `src/contexts/userContext.tsx`) into the root layout so client components can read auth state.
  - New routes: `/entrar`, `/casa`, `/casa/editar`, `/casa/inscritos`, `/casa/textos`, `/criar` (moved).
  - Remove `/criar-texto` route. Update the link in `frontend/src/app/admin/page.tsx` to point to `/criar`.
  - Replace the no-op `frontend/src/middleware.ts` with one that builds a server-side PocketBase client from `cookies()` and redirects unauthenticated requests for `/casa/*` and `/criar` to `/entrar?redirect=<pathname>`. Keep a small client-side fallback in the autor layout for the case where the in-memory auth store goes invalid mid-session (e.g., `authRefresh` failure).
  - Add a tiny `getMinhaNiusleter()` helper that fetches the niusleter where `usuario = pb.authStore.model.id`.
- **Backend** (`backend/`):
  - One PocketBase migration updating `listRule`/`viewRule`/`createRule`/`updateRule`/`deleteRule` on `niusleteres`, `textos`, and `inscritos` per the rules above.
- **Docs**:
  - `docs/DATABASE_SCHEMA.md`: update the permissions sections for `niusleteres`, `textos`, `inscritos` to reflect the new rules.
- **Not affected**: email pipeline, `convites`, `rodapes` (still managed by hooks), the editor UI itself, the public reading routes (`/[niusleter_path]/[text_path]`).
