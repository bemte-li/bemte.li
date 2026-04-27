## Context

Bemte.li already ships its public reading experience and the editor UI at `/criar-texto`, but everything authenticated lives behind the PocketBase admin console (`/_/`). The PocketBase JS SDK is already a dependency, and the codebase even has a half-wired `UserContextProvider` in `frontend/src/contexts/userContext.tsx` that calls `pb.collection("usuarios").authWithPassword(...)` and listens to `pb.authStore.onChange`. It is not currently mounted in the root layout, so no component reads it. A no-op `middleware.ts` exists but does not enforce anything.

The `usuarios` collection is the standard PocketBase auth collection. The other collections (`niusleteres`, `textos`, `inscritos`) all have `createRule`/`updateRule`/`deleteRule = null` (admin-only). Public `listRule`/`viewRule = ""` covers the reading site. To make `/casa` actually do anything, those rules must permit the autor (the user referenced by `niusleteres.usuario`) to operate on records that belong to their own niusleter.

`niusleteres.usuario` carries a unique constraint, so the relationship is one-to-one for now. We rely on that here.

## Goals / Non-Goals

**Goals:**
- A user with a `usuarios` record (created via the PocketBase admin) can sign in at `/entrar` and land on `/casa`.
- From `/casa` the autor can edit their niusleter, see a read-only list of their textos, and a read-only list of their inscritos.
- From `/casa` the autor can navigate to `/criar` (the existing editor, just relocated and gated by auth).
- The PocketBase rules let an authenticated autor do exactly what the UI offers — and no more.
- Voice and styling stay on-brand: monospace Cousine, brand tokens, Portuguese copy.

**Non-Goals:**
- No signup, no "esqueci minha senha", no account self-service.
- No actual save-to-API or publish-to-API for textos in `/criar` (that stays a future change; the editor keeps its localStorage autosave behavior).
- No edit/delete actions on `/casa/textos`, no remove/export on `/casa/inscritos`.
- No fully-`httpOnly` cookie / Server-Action proxy for auth. The SDK has to live on the client (it's the same one that does file URLs and direct collection calls), so the cookie has to be JS-readable. PocketBase's API rules — not cookie flags — are the actual security boundary.
- No SSR of `/casa/*` page content in this change. Middleware is server-side; the page bodies stay client components for now (the data they show is auth-scoped and can be fetched from the browser).
- No multi-niusleter-per-autor support.
- No legacy redirect from `/criar-texto` to `/criar` — the old URL simply 404s after this change. The only known internal reference (in `/admin/page.tsx`) is updated.

## Decisions

### 1. Auth storage: cookie-mirrored PocketBase auth store
We follow the de-facto PocketBase + Next.js App Router pattern (described in PB issues [#69](https://github.com/pocketbase/js-sdk/issues/69) / [#4065](https://github.com/pocketbase/pocketbase/discussions/4065) and the canonical dev.to write-up "[NextJS App Router with Pocketbase SSR setup](https://dev.to/tsensei/nextjs-app-router-with-pocketbase-ssr-setup-1m9k)"):

- The PocketBase JS SDK keeps its default `localStorage` store on the client.
- A `pb.authStore.onChange(...)` handler (registered once in the browser-client factory) mirrors the current auth state into a `pb_auth` cookie via `pb.authStore.exportToCookie({ httpOnly: false, secure: <prod>, sameSite: 'Lax' })`. Login/logout/refresh all flow through `onChange`, so the cookie stays in sync automatically.
- A per-request server client reads the same cookie via `pb.authStore.loadFromCookie(...)` — these are first-class helpers exposed by the SDK precisely for this case (the maintainer in PB discussion [#3201](https://github.com/pocketbase/pocketbase/discussions/3201) calls them "just helpers that work with plain cookies").

We refactor `frontend/src/lib/pocketbase.ts` to export two factories matching the community shape:

```ts
let singleton: PocketBase | null = null

export function createBrowserClient(): PocketBase {
  if (typeof window === 'undefined') {
    return new PocketBase(getInternalUrl())
  }
  if (!singleton) {
    singleton = new PocketBase(getPublicUrl())
    singleton.authStore.onChange(() => {
      document.cookie = singleton!.authStore.exportToCookie({
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      })
    })
  }
  return singleton
}

export function createServerClient(cookieStore?: ReadonlyRequestCookies): PocketBase {
  const pb = new PocketBase(getInternalUrl())
  const c = cookieStore?.get('pb_auth')
  if (c) pb.authStore.loadFromCookie(`${c.name}=${c.value}`)
  return pb
}
```

The existing public helpers (`getTextosByNiusleter`, `getNiusleterByPath`, etc.) currently call `getServerSideInstance()` (unauthenticated server fetches). They're rewritten to call `createServerClient()` with no cookie — same behavior, but the function names now match what the rest of the codebase will use.

The `UserContextProvider` is updated to call `createBrowserClient()`. Behavior is otherwise unchanged.

**Why this over plain localStorage**:
- Middleware can read it. We can do *server-side* redirects before any HTML is rendered (no flash, no router-replace dance).
- Server Components could later read auth-aware data without re-architecting. Future-proofs the foundation cheaply.
- The SDK ships first-class helpers for exactly this; we're not inventing anything.

**Why not full `httpOnly` (Server-Action proxy) auth**:
- Would require funneling every authenticated PocketBase call through a Next.js Server Action / API route, because the SDK on the client wouldn't have a token. That's a much bigger architectural change.
- The XSS exposure of a JS-readable cookie is essentially the same as `localStorage` in practice (both are reachable from any script in the page). The real defenses are PocketBase's API rules and our F1–F6 frontend security rules (DOMPurify, no `dangerouslySetInnerHTML` of untrusted input). We're not weakening either of those.
- Token expiry/rotation is unchanged either way: PocketBase JWTs expire and `authRefresh` rotates them; the cookie's `Expires`/`Max-Age` is set from the JWT's `exp` claim by `exportToCookie`.

**Cookie attributes**:
- `httpOnly: false` — required for the SDK on the client to read/refresh it (PB SDK runs in JS, it cannot be httpOnly).
- `secure: true` in production, `false` in dev (HTTP localhost).
- `sameSite: 'Lax'` — standard for first-party app cookies; we don't make cross-site authenticated requests.
- `path: /` — default; the cookie is needed everywhere.

### 2. Route protection: Next.js middleware reads the `pb_auth` cookie
With auth state in a cookie, we can gate routes at the edge before HTML is rendered. The current `frontend/src/middleware.ts` is a no-op; we replace it.

```ts
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/pocketbase'

const PROTECTED = [/^\/casa(\/|$)/, /^\/criar(\/|$)/]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!PROTECTED.some(r => r.test(pathname))) return NextResponse.next()

  const pb = createServerClient(await cookies())
  if (pb.authStore.isValid) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/entrar'
  url.search = '?redirect=' + encodeURIComponent(pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)'],
}
```

**Defense in depth**: middleware is for routing, not security. The actual security boundary is **PocketBase API rules** (`niusleter.usuario = @request.auth.id`, etc.) — they enforce ownership server-side regardless of what the client sends. CVE-2025-29927 (Next.js middleware bypass, patched in 14.2.25+ / 15.2.3+) is a reminder: never let middleware be the only gate. Our PocketBase rules are the gate; middleware is convenience.

**Client-side fallback**: a tiny `(autor)/layout.tsx` still calls `useUser()` and, if the in-memory store reports invalid (e.g. an `authRefresh` failed mid-session and cleared the store but the cookie is briefly stale), `router.replace('/entrar?redirect=...')`. This is belt-and-suspenders, not the primary mechanism.

**`/entrar` redirects the inverse direction**: middleware also redirects `/entrar` → `/casa` when `authStore.isValid`. This avoids logged-in users seeing the login form.

**Trade-off**: middleware runs on every matched request — the `createServerClient(cookies())` call is cheap (no network — `loadFromCookie` just parses the JWT and does no remote validation). PocketBase's actual token verification still happens at every API call via the JWT signature.

**Trade-off**: cookies are not validated against the server in middleware. A revoked token could remain `isValid` from middleware's perspective until it expires. Acceptable: any actual PocketBase API call will reject a revoked token, the autor will get a permission error, and on the next page load the `authRefresh` in `UserContextProvider` will clear the store.

### 3. Wire `UserContextProvider` into the root layout
The provider already exists at `frontend/src/contexts/userContext.tsx`. We mount it once in `app/layout.tsx`'s `<body>` so any client component (navbar, login form, casa pages, the autor layout fallback) can call `useUser()`.

We update its internal `getClientSideInstance()` call to use the new `createBrowserClient()` factory so it picks up the cookie-mirror `onChange` handler. The provider's `signIn`/`signOut` semantics stay unchanged (PocketBase's `onChange` fires on `authWithPassword` and `authStore.clear`, so the cookie updates automatically without extra code in the provider). `createAccount` is left in place but unused.

### 4. Move `/criar-texto` → `/criar`
Physically move `frontend/src/app/criar-texto/` to `frontend/src/app/criar/`. No content changes to `page.tsx`. Update the only known internal link (`frontend/src/app/admin/page.tsx`).

**Why a move and not an alias**: matches the user's intent; keeps the URL space clean; we don't want two paths for the same page. The route is currently behind a "Painel Administrativo" page anyway, so external SEO impact is negligible.

### 5. Editing `caminho` on the niusleter
The niusleter `caminho` is the public URL slug. Changing it breaks every existing link to `/<old-caminho>` and `/<old-caminho>/<text-path>`.

We allow it (per the user's choice) but the `/casa/editar` form **MUST**:
- Show a permanent warning next to the field explaining the consequence.
- Show a confirmation modal on submit when `caminho` differs from the current value, listing what will break.
- Validate the pattern client-side (`^[a-z0-9-]+$`) to mirror the migration's existing constraint.

We do **not** introduce server-side redirects from old `caminho` to new `caminho`. Out of scope.

### 6. PocketBase permission rules

For `niusleteres`:
- `listRule`: `""` (unchanged — public listing)
- `viewRule`: `""` (unchanged — public read)
- `createRule`: `null` (admin only — first-niusleter creation flow is out of scope)
- `updateRule`: `usuario = @request.auth.id` (only the owner can update their own niusleter)
- `deleteRule`: `null` (admin only)

For `textos`:
- `listRule`: `""` (unchanged — public listing)
- `viewRule`: `""` (unchanged — public read)
- `createRule`: `niusleter.usuario = @request.auth.id`
- `updateRule`: `niusleter.usuario = @request.auth.id`
- `deleteRule`: `niusleter.usuario = @request.auth.id`

For `inscritos`:
- `listRule`: `niusleter.usuario = @request.auth.id` (only the owner can list their inscritos — these are private)
- `viewRule`: `niusleter.usuario = @request.auth.id`
- `createRule`: `null` (subscription happens through the public-facing subscribe flow, which is admin/hook-driven; not changed here)
- `updateRule`: `null`
- `deleteRule`: `null`

**Why expose `textos` create/update/delete rules now even though we're not wiring the save UI in this change**: it's the same migration touchpoint and avoids a second migration when the next change wires `/criar` to the API. Spec scenarios cover the rules; the UI just doesn't use create/update/delete yet.

**Why not loosen `inscritos` create rule**: the public subscription flow (`createInscricao`) currently goes through the public-facing site. That's not what the autor area touches. Keeping `createRule: null` until we revisit the inscription pipeline avoids accidentally letting an autor mass-add inscritos to their own list.

### 7. Loading the autor's niusleter
Casa pages need the autor's niusleter to render anything. We add a small client helper `getMinhaNiusleter()` in `frontend/src/lib/pocketbase.ts` that does:

```ts
const pb = getClientSideInstance();
return pb.collection('niusleteres').getFirstListItem(`usuario="${pb.authStore.model.id}"`);
```

If it returns nothing (autor exists but has no niusleter row yet), we show a friendly "ainda não há niusleter associada à sua conta — peça pra alguém da Bemte.li configurar" message and a logout button. This avoids hard crashes in edge cases while staying explicit that account/niusleter creation is admin-only.

### 8. Logout
A `Sair` button in the `/casa` header calls `signOut()` and `router.replace('/')`.

## Risks / Trade-offs

- **Risk**: XSS in any client component → JS reads the `pb_auth` cookie or `localStorage` → token theft. **Mitigation**: existing F1–F6 frontend security rules; all user HTML rendered through DOMPurify; no `dangerouslySetInnerHTML` of untrusted strings introduced in this change. PocketBase rules constrain what the stolen token can do (only the autor's own niusleter and its records).
- **Risk**: A malicious autor crafts API calls with another niusleter's ID. **Mitigation**: PocketBase rules enforce `niusleter.usuario = @request.auth.id` server-side for textos/inscritos and `usuario = @request.auth.id` for niusleteres updates. The UI is not the security boundary. Middleware is not either.
- **Risk**: Middleware-bypass class of vulnerabilities (cf. CVE-2025-29927). **Mitigation**: keep Next.js patched; rely on PocketBase rules — middleware bypass would let an attacker render `/casa/*` HTML, but every actual data call still goes through PocketBase and would be rejected without a valid token.
- **Risk**: Revoked-but-unexpired token still passes middleware's cheap `loadFromCookie` check. **Mitigation**: any real API call validates the JWT signature server-side; `UserContextProvider` calls `authRefresh` on app load and clears the store on failure, which fires `onChange` and clears the cookie too.
- **Risk**: Changing `caminho` silently breaks existing public links and any external references. **Mitigation**: warning copy + confirm modal in `/casa/editar`; documented as an explicit trade-off.
- **Risk**: Cookie + localStorage drift (e.g. token edited in one tab and not the other). **Mitigation**: `pb.authStore.onChange` fires across the SDK's `BroadcastChannel` sync; the cookie tracks whatever the in-memory store says. If an extreme drift occurs, `authRefresh` resolves it on next page load.
- **Trade-off**: Removing `/criar-texto` is a (small) BREAKING URL change. Acceptable — there are no published external links to it; the editor was always behind `/admin`.
- **Trade-off**: We leave `niusleteres.createRule = null`. An autor cannot self-provision a niusleter. Intentional — we want to keep onboarding deliberate while the project is invite-only.
- **Trade-off**: The `pb_auth` cookie is JS-readable (`httpOnly: false`). Required by the SDK; full-`httpOnly` would mean a Server-Action proxy for every authenticated call. Out of scope, and the security boundary doesn't actually live in cookie flags.

## Migration Plan

1. **Backend migration (deploys safely on its own)**: ship a single PocketBase Go migration `<timestamp>_update_rules_area_do_autor.go` that updates the rules above. No data migration needed. Rollback is the corresponding `down`.
2. **Frontend changes**: ship the routes and the route-group guard. Without step 1 deployed, the autor would see permission errors on `/casa/editar`'s save and `/casa/inscritos`'s list — but read paths still work.
3. **Deploy order**: backend first, then frontend. They can land in the same release; deploying frontend first is safe but leaves the area read-only for inscritos.
4. **Doc**: update `docs/DATABASE_SCHEMA.md` permissions for the three collections.
5. **Rollback**: revert the PocketBase migration to restore the prior `null` rules; the autor area becomes read-only / errors out, which is acceptable while we investigate.

## Open Questions

None blocking implementation. Future follow-ups (each their own change):
- Wire `Salvar`/`Publicar` in `/criar` to actually persist textos.
- Edit/delete textos from `/casa/textos`.
- Subscriber management (remove, export) on `/casa/inscritos`.
- Self-serve account creation and password reset.
- Multi-niusleter per autor (drops the unique constraint on `niusleteres.usuario`).
