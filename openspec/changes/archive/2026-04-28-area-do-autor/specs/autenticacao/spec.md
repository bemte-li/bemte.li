## ADDED Requirements

### Requirement: Login screen at `/entrar`
The system SHALL provide a `/entrar` route where a user can sign in with the email and password of an existing `usuarios` record.

The form SHALL accept exactly two fields: email and password. It SHALL NOT offer signup, password reset, or social login.

#### Scenario: Successful login
- **WHEN** an unauthenticated visitor submits valid credentials at `/entrar`
- **THEN** the system authenticates them via `pb.collection("usuarios").authWithPassword(email, password)` and redirects them to `/casa`

#### Scenario: Invalid credentials
- **WHEN** the user submits an email/password that PocketBase rejects
- **THEN** the form stays on `/entrar` and shows an inline error message in Portuguese (e.g. "E-mail ou senha incorretos") without exposing whether the email exists

#### Scenario: Empty fields
- **WHEN** the user submits the form with an empty email or password
- **THEN** the form blocks submission and shows a Portuguese validation message next to the offending field

### Requirement: Already-authenticated users skip `/entrar`
The system SHALL redirect users who already have a valid PocketBase auth session away from `/entrar`, before any login-form HTML is rendered.

#### Scenario: Logged-in user opens `/entrar`
- **WHEN** a user with a valid `pb_auth` cookie navigates to `/entrar`
- **THEN** Next.js middleware reads the cookie via `pb.authStore.loadFromCookie`, sees `authStore.isValid === true`, and responds with a redirect to `/casa` — the login form HTML is never sent to the browser

### Requirement: Redirect-target preservation
The system SHALL respect a `?redirect=<path>` query parameter on `/entrar` so that users sent there from a protected route return to the page they were trying to reach after login.

The redirect target MUST be a same-origin pathname; absolute URLs and external origins SHALL be rejected and treated as no redirect (default to `/casa`).

#### Scenario: Login from a deep-linked protected route
- **WHEN** an unauthenticated user visits `/casa/editar` and is redirected to `/entrar?redirect=%2Fcasa%2Feditar`, then submits valid credentials
- **THEN** the system redirects them to `/casa/editar` after successful authentication

#### Scenario: Hostile external redirect target
- **WHEN** the visitor reaches `/entrar?redirect=https%3A%2F%2Fevil.example.com%2F` and logs in successfully
- **THEN** the system ignores the redirect and sends them to `/casa` instead

### Requirement: Session persistence across reloads
The system SHALL keep the autor logged in across page reloads using the PocketBase JS SDK's default `localStorage`-backed auth store, mirrored into a `pb_auth` cookie (see "Auth state cookie mirror" below), and SHALL refresh the auth token on app load via `pb.collection("usuarios").authRefresh()`.

#### Scenario: Reload after login
- **WHEN** a logged-in user reloads any page in the app
- **THEN** the system rehydrates the session from `localStorage`, refreshes it against PocketBase, and exposes the user via `useUser()` without forcing them back to `/entrar`

#### Scenario: Session refresh fails (token revoked or expired)
- **WHEN** `authRefresh()` rejects on app load
- **THEN** the system clears `pb.authStore` (which fires `onChange` and clears the `pb_auth` cookie), sets the user to `null`, and (only on protected routes) redirects to `/entrar`

### Requirement: Logout
The system SHALL expose a logout action that clears the PocketBase auth store, removes the `pb_auth` cookie, and returns the user to the public site.

#### Scenario: Logout from `/casa`
- **WHEN** the autor clicks the "Sair" button visible in the `/casa` header
- **THEN** the system calls `pb.authStore.clear()`, the `onChange` handler updates the `pb_auth` cookie to its empty/expired form, the user is set to `null`, and the system replaces the current route with `/`

#### Scenario: Subsequent visit to a protected route after logout
- **WHEN** a user who has just logged out navigates back to `/casa` (e.g. via the browser's back button)
- **THEN** Next.js middleware reads the now-empty `pb_auth` cookie, sees no valid session, and responds with a redirect to `/entrar?redirect=%2Fcasa`

### Requirement: Authenticated-user context provider
The system SHALL expose an authentication context that returns the current `usuarios` record (or `null`), a `loading` flag during initial hydration, and `signIn`/`signOut` functions, mounted once at the root of the app so any client component can call `useUser()`.

#### Scenario: Component reads the user
- **WHEN** any client component within the app tree calls `useUser()`
- **THEN** it receives `{ user, loading, error, signIn, signOut, ... }` reflecting the current PocketBase auth state, without each component having to instantiate its own PocketBase client

### Requirement: Auth state cookie mirror (`pb_auth`)
The system SHALL mirror the PocketBase auth state into a cookie named `pb_auth` so that Next.js middleware and Server Components can read it via `pb.authStore.loadFromCookie(...)`.

The cookie SHALL be written from the browser via the SDK's `pb.authStore.exportToCookie(...)` helper from a single `pb.authStore.onChange` handler registered in the browser-side PocketBase factory. The cookie attributes SHALL be:
- `httpOnly: false` (the SDK in the browser must be able to read and refresh it)
- `secure: true` in production environments, `false` in development (HTTP localhost)
- `sameSite: 'Lax'`
- `path: /`
- `Expires` / `Max-Age` derived from the JWT `exp` claim by `exportToCookie`

The cookie SHALL NOT be the security boundary. PocketBase API rules — which validate the JWT signature on every request — remain the authoritative gate.

#### Scenario: Successful login writes the cookie
- **WHEN** a user successfully calls `signIn(email, password)` on the client
- **THEN** the SDK fires `authStore.onChange`, the registered handler writes `document.cookie = pb.authStore.exportToCookie({ httpOnly: false, secure: <prod>, sameSite: 'Lax' })`, and a subsequent same-origin request includes the `pb_auth` cookie

#### Scenario: Logout clears the cookie
- **WHEN** the user calls `signOut()` (which calls `pb.authStore.clear()`)
- **THEN** the `onChange` handler fires with an empty store and `exportToCookie` writes a `pb_auth` cookie with empty value and an expired `Max-Age`, so subsequent server-side reads see no auth

#### Scenario: Server reads the cookie
- **WHEN** a server-side caller (middleware or a Server Component) instantiates a PocketBase client via `createServerClient(cookies())`
- **THEN** the factory looks up `pb_auth` from the request cookies and calls `pb.authStore.loadFromCookie(...)`, after which `pb.authStore.isValid` reflects the user's current login state
