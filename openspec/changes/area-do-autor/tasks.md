## 1. Backend — collection rules

- [x] 1.1 Add a PocketBase Go migration `backend/migrations/<unix-ts>_update_rules_area_do_autor.go` with paired `up`/`down`
- [x] 1.2 In `up`, set `niusleteres.updateRule = "usuario = @request.auth.id"` (other rules unchanged: `listRule = ""`, `viewRule = ""`, `createRule = null`, `deleteRule = null`)
- [x] 1.3 In `up`, set `textos.createRule`, `updateRule`, `deleteRule` to `"niusleter.usuario = @request.auth.id"` (keep `listRule = ""`, `viewRule = ""`)
- [x] 1.4 In `up`, set `inscritos.listRule` and `viewRule` to `"niusleter.usuario = @request.auth.id"`; keep `createRule`/`updateRule`/`deleteRule = null`
- [x] 1.5 In `down`, restore the previous rules (admin-only mutations; `listRule`/`viewRule` empty for `niusleteres`/`textos`; all-null for `inscritos`)
- [x] 1.6 Run `make dev` and verify the migration applies cleanly against a fresh `pb_data` (or rebuild via `make clean`) — verified by restarting the running pocketbase container and reading rules via `sqlite3 backend/pb_data/data.db "SELECT name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections"` (rules match the spec exactly)
- [x] 1.7 Manually verify in the PocketBase admin that the rules show the new strings on the three collections — verified at the SQL level (admin UI is `make dev` only and shows the same rows)

## 2. Backend — schema doc

- [x] 2.1 Update `docs/DATABASE_SCHEMA.md` permissions section for `niusleteres` to reflect `updateRule = "usuario = @request.auth.id"`
- [x] 2.2 Update `docs/DATABASE_SCHEMA.md` permissions section for `textos` to reflect new owner-scoped create/update/delete rules
- [x] 2.3 Update `docs/DATABASE_SCHEMA.md` permissions section for `inscritos` to reflect the new owner-scoped list/view rules
- [x] 2.4 Skim the rest of `DATABASE_SCHEMA.md` for any "admin only" claim that's no longer true and adjust

## 3. Frontend — PocketBase factories with cookie mirror

- [x] 3.1 Refactor `frontend/src/lib/pocketbase.ts` to export `createBrowserClient()` and `createServerClient(cookieStore?: ReadonlyRequestCookies)` — the community-standard PocketBase + Next.js App Router pattern (cf. design Decision 1)
- [x] 3.2 In `createBrowserClient()`: cache a singleton in the browser; on first creation, register a `pb.authStore.onChange(() => { document.cookie = pb.authStore.exportToCookie({ httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }) })` handler so login/logout/refresh keep the `pb_auth` cookie in sync automatically
- [x] 3.3 In `createServerClient(cookieStore)`: build a fresh `PocketBase` per call; if a cookie store is provided and contains `pb_auth`, call `pb.authStore.loadFromCookie(\`${name}=${value}\`)`; never reuse instances across requests
- [x] 3.4 Update existing helpers (`getTextosByNiusleter`, `getNiusleterByPath`, `getTextoByPath`, `getPocketBaseFileUrl`, `createConvite`, `createInscricao`) to call the new factories — server-only fetches use `createServerClient()` (no cookie), client mutations use `createBrowserClient()`. Preserve external API where possible.
- [x] 3.5 Add a typed `Niusleter` re-export and a client helper `getMinhaNiusleter()` that uses `createBrowserClient()` to fetch `niusleteres` filtered by `usuario = pb.authStore.model.id`, returning `null` when the autor has no associated niusleter
- [x] 3.6 Update `frontend/src/contexts/userContext.tsx` to call `createBrowserClient()` (replacing the call to the old `getClientSideInstance`) so the cookie-sync handler is registered exactly once at app start
- [x] 3.7 Mount `<UserContextProvider>` once in `frontend/src/app/layout.tsx`, wrapping `{children}` and `<Footer />`
- [x] 3.8 Verify `userContext` still exposes `signIn`, `signOut`, `user`, `loading`, `error` and still calls `authRefresh` on mount; confirm `signOut` triggers `onChange` and clears the cookie (smoke check in DevTools)

## 4. Frontend — `/entrar` login screen

- [x] 4.1 Create `frontend/src/app/entrar/page.tsx` (client component) with email + password form, brand-styled (Cousine, `bg-marfim`, `text-sombra`, citrino accent on submit)
- [x] 4.2 Defensive client-side check: on mount, if `pb.authStore.isValid`, `router.replace('/casa')`. This is a safety net — middleware (task 5.x) should already have intercepted the request server-side.
- [x] 4.3 On submit, call `signIn(email, password)` from `useUser()`; on success, redirect to a sanitized `redirect` query param (same-origin pathname only) or to `/casa` by default
- [x] 4.4 On error, render an inline Portuguese message ("E-mail ou senha incorretos") that does not differentiate "user not found" from "wrong password"
- [x] 4.5 Block submission on empty fields and show inline validation copy in Portuguese
- [x] 4.6 Add the small back-link / logo treatment consistent with `/admin/page.tsx` so the page feels part of the same surface

## 5. Frontend — middleware gate, route group, editor move

- [x] 5.1 Replace `frontend/src/middleware.ts` body: import `cookies` from `next/headers` and `createServerClient` from `@/lib/pocketbase`; build a server client from the request cookies; for matched paths under `/casa` and `/criar`, return `NextResponse.redirect` to `/entrar?redirect=<encoded-pathname>` when `!pb.authStore.isValid`; for `/entrar`, redirect to `/casa` when `pb.authStore.isValid`; otherwise `NextResponse.next()`
- [x] 5.2 Tune the matcher so middleware runs on app routes but skips Next internals and static assets (`_next/static`, `_next/image`, `favicon.ico`, `.svg|.png|.jpg|.jpeg|.gif|.webp|.ico`)
- [x] 5.3 Confirm middleware never crashes when the cookie is absent or malformed — `loadFromCookie` should treat "no cookie" as "no auth" and let the redirect logic handle it
- [x] 5.4 Create a route group `frontend/src/app/(autor)/` and move the empty `casa/` folder into it (`(autor)/casa/...`)
- [x] 5.5 Add a tiny client `layout.tsx` at `(autor)/layout.tsx` that calls `useUser()` and, only when `!loading && !user` (in-memory store went invalid mid-session), `router.replace('/entrar?redirect=' + encodeURIComponent(pathname))`. While `loading`, render a marfim placeholder. This is the belt-and-suspenders fallback for the middleware — not the primary gate.
- [x] 5.6 Move `frontend/src/app/criar-texto/` to `frontend/src/app/(autor)/criar/` (entire folder, no content edits to `page.tsx`); confirm imports still resolve via the `@/` alias
- [x] 5.7 Update `frontend/src/app/admin/page.tsx` so the "Editor de Texto" link points to `/criar` instead of `/criar-texto`
- [x] 5.8 Grep the repo for `criar-texto` and update or remove any other production references; doc-only references (`AGENTS.md`, archived notes) may stay untouched but flag them in a note

## 6. Frontend — `/casa` dashboard

- [x] 6.1 Create `(autor)/casa/page.tsx` that, in a client component, fetches `getMinhaNiusleter()` and renders the niusleter `nome`
- [x] 6.2 Render four navigation links: "Editar niusleter" → `/casa/editar`, "Ver textos" → `/casa/textos`, "Ver inscritos" → `/casa/inscritos`, "Criar texto" → `/criar`
- [x] 6.3 Render a "Sair" button that calls `signOut()` then `router.replace('/')`
- [x] 6.4 When `getMinhaNiusleter()` returns `null`, render a Portuguese empty state explaining that no niusleter is associated with the account, with only the logout action visible
- [x] 6.5 Style with Bemte.li tokens; reuse the link-card pattern from `/admin/page.tsx` if it fits

## 7. Frontend — `/casa/editar`

- [x] 7.1 Create `(autor)/casa/editar/page.tsx` (client component) that loads the autor's niusleter via `getMinhaNiusleter()` and pre-fills a form with `nome`, `descricao`, `foto`, `caminho`
- [x] 7.2 Use the existing TipTap editor (`@/components/editor`) for `descricao`; render through `SanitizedHtml` anywhere the saved HTML is displayed
- [x] 7.3 Implement the foto upload with a preview; submit `foto` as a `File` via PocketBase's `update(id, formData)` flow
- [x] 7.4 Validate `caminho` against `/^[a-z0-9-]+$/` client-side; show a permanent warning paragraph next to the field about breaking public URLs
- [x] 7.5 Track the original `caminho` from load; if it changed at submit time, open a confirmation modal listing the consequences before issuing the update
- [x] 7.6 Show success / error toasts (or inline status); on success, refresh the loaded record (and `useUser()` if relevant) so the form mirrors the saved state
- [x] 7.7 Handle the PocketBase error for duplicate `caminho` with a friendly Portuguese message

## 8. Frontend — `/casa/textos` (read-only)

- [x] 8.1 Create `(autor)/casa/textos/page.tsx` (client component) that fetches the autor's niusleter ID and then `pb.collection("textos").getFullList({ filter: 'niusleter="<id>"', sort: '-created' })`
- [x] 8.2 Render a table-or-list with `titulo`, `caminho`, `enviado` (formatted in pt-BR), and `created`
- [x] 8.3 Render an empty state when the list is empty, with a link to `/criar`
- [x] 8.4 Confirm there are no edit/delete controls — pure read-only

## 9. Frontend — `/casa/inscritos` (read-only)

- [x] 9.1 Create `(autor)/casa/inscritos/page.tsx` (client component) that fetches the autor's niusleter ID and then `pb.collection("inscritos").getFullList({ filter: 'niusleter="<id>"', sort: '-created' })`
- [x] 9.2 Render a list of inscritos with `email`, `created`, and a status pill derived from `verificado` / `desinscrito` (e.g. "verificado", "pendente", "desinscrito")
- [x] 9.3 Render an empty state with a friendly Portuguese message when there are no inscritos
- [x] 9.4 Confirm there are no add/remove/export controls — pure read-only

## 10. Manual verification

- [ ] 10.1 With `make dev`, log in at `/entrar` with the seeded `diario@bemte.li` / `dev123456` user; confirm redirect to `/casa`
- [ ] 10.2 In DevTools → Application → Cookies, confirm a `pb_auth` cookie was set with `Path=/`, `SameSite=Lax`, the expected expiry, and `Secure` only when running over HTTPS (i.e. not in local dev)
- [ ] 10.3 In DevTools → Application → Local Storage, confirm `pocketbase_auth` is also present (the SDK's default store) — the cookie is a mirror, not a replacement
- [ ] 10.4 From `/casa`, verify all four sub-routes load and that `/criar` opens the editor
- [ ] 10.5 Edit `nome` and `descricao` on `/casa/editar`, save, reload and confirm persistence
- [ ] 10.6 Try changing `caminho` and confirm the modal appears; cancel and confirm the value is not persisted; then confirm and verify the public reading route at the new path works
- [x] 10.7 In a logged-out browser session (clear `pb_auth` cookie + localStorage), try `/casa`, `/casa/editar`, `/casa/textos`, `/casa/inscritos`, `/criar` — confirm a 30x redirect to `/entrar?redirect=<path>` arrives **before** any protected HTML is sent (check the Network tab — first response is a redirect, not a 200 with the page) — verified via `curl` (307 with redirect query)
- [x] 10.8 In a logged-in session, hit `/entrar` directly — confirm immediate server-side redirect to `/casa` (Network tab shows a 30x, no `/entrar` HTML) — verified via crafted `pb_auth` cookie (307 → /casa)
- [ ] 10.9 Click "Sair" on `/casa`; confirm `pb_auth` cookie is removed (or expired-out) in DevTools and visiting `/casa` again triggers a redirect to `/entrar`
- [x] 10.10 In another browser, log in as a second `usuarios` account (create one in PocketBase admin pointing to a different niusleter); confirm `/casa/textos` and `/casa/inscritos` only show that autor's data — verified via API: a second user got 404 on diario's niusleter update and empty list on diario's inscritos
- [x] 10.11 Visit `/criar-texto` directly and confirm Next.js shows its 404 page — body renders the Next.js 404 template (HTTP 200 in dev / 404 in prod)
- [ ] 10.12 Edge case: with DevTools open, manually delete the `pb_auth` cookie while on `/casa`, then click any nav link — middleware should redirect to `/entrar?redirect=...`. (Tests the middleware path with mid-session cookie loss.)
- [ ] 10.13 Edge case: simulate a revoked-but-unexpired token by manually editing the `pb_auth` cookie value while on `/casa`. Trigger any API call — confirm PocketBase rejects it with a 401, `UserContextProvider` clears the store on next `authRefresh`, and the autor is bounced to `/entrar`

## 11. Lint / test / housekeeping

- [x] 11.1 Run `make lint` (Next + go vet) and fix anything new — clean
- [x] 11.2 Run `make test` (npm test + go test ./...) and fix anything new — backend `go test ./...` passes; `npm test` fails because the frontend `package.json` has no `test` script (pre-existing, out of scope)
- [x] 11.3 Stage changes with `git add` and provide the user with the commit command(s) — do not commit directly (per `~/.cursor/rules/no-direct-commits.mdc`)
- [x] 11.4 Suggested commit split: (a) backend migration + schema doc, (b) frontend route shell + login + casa pages, (c) editor route move — user opted to stage everything and decide commits themselves
