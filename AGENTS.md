# AGENTS.md

Guidance for AI coding agents working on **Bemte.li** — a 100% Brazilian, free, open-source newsletter ("niusleter") alternative. This file is in English so agents work better, but the **product, code, and commits are in Portuguese**.

## What is Bemte.li

Bemte.li is not a platform, app, or social network. It sends emails and archives content at a URL. No ads, no investors, no profit motive, no algorithms. The project is built by three people (a designer, a programmer, and a writer) as a deliberate stance against platform capitalism (the "feudalismo digital"). Reference: `README.md` and `Diário de borda.md`.

When writing copy, naming things, or making product decisions, default to this voice: warm, plain-spoken, slightly poetic Portuguese. No corporate / SaaS tone.

## Tech Stack

### Frontend (`frontend/`)
- **Next.js 14** (App Router) + **React 18**
- **TypeScript**
- **Tailwind CSS** + `@tailwindcss/typography`
- **TipTap** (rich text editor) — used for newsletter body and footer (`rodape`) editing
- **PocketBase JS SDK** (`pocketbase` package) for API calls
- **DOMPurify** for sanitizing user-generated HTML

### Backend (`backend/`)
- **Go 1.24**
- **PocketBase** (v0.28.x) used as a Go library, not as a binary
- **SQLite** (via `modernc.org/sqlite`)
- **Air** for hot-reload in dev
- Migrations live in `backend/migrations/` (PocketBase Go migrations, timestamp-prefixed)
- Custom hooks live in `backend/internal/hooks/`
- App setup in `backend/internal/config/setup.go`

### Mail
- **Stalwart Mail Server** (self-hosted) in production
- **smtp4dev** for local development (UI on `:8025`)

### Infra (`docker/`)
- **Docker Compose** — `docker-compose.dev.yml` and `docker-compose.prod.yml`
- **Nginx** as reverse proxy (`docker/nginx/`)
- **Let's Encrypt** for TLS

## Project Layout

```
bemte.li/
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/             # App Router routes (Portuguese paths!)
│   │   ├── components/      # React components
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/             # pocketbase.ts, types.ts
│   │   └── middleware.ts
│   ├── public/              # Logos, SVGs (Logo-Horizontal, So-Passaros, etc.)
│   └── tailwind.config.js   # Brand tokens live here
├── backend/                 # PocketBase + Go
│   ├── main.go
│   ├── internal/
│   │   ├── config/setup.go  # App init, SMTP, dev superuser
│   │   └── hooks/           # convite_email.go, rodape_handler.go
│   └── migrations/          # 17xxxxxxxx_*.go files
├── docker/                  # Compose files, nginx, scripts
├── docs/
│   └── DATABASE_SCHEMA.md   # Full schema reference — read this before DB work
├── openspec/                # Spec-driven change proposals (see "OpenSpec" below)
│   ├── config.yaml
│   ├── specs/               # Current capability specs
│   └── changes/             # Proposed/active changes (+ archive/)
├── Diário de borda.md       # Project voice / philosophy
├── email-template.mjml      # MJML source for newsletter emails
├── email-template.html      # Compiled MJML output
├── Makefile
└── vibe-coding-docs/        # Throwaway planning docs (never commit)
```

## Brand & Design System

Brand tokens are defined in `frontend/tailwind.config.js`. Always use these named tokens — do **not** hardcode hex values in components.

### Colors
| Token     | Hex       | Usage                                  |
|-----------|-----------|----------------------------------------|
| `sombra`  | `#1C1717` | Primary text / borders (near-black)    |
| `marfim`  | `#FFFCEC` | Page background (warm off-white/ivory) |
| `citrino` | `#ECCB2B` | Yellow highlight / primary accent      |
| `rosa`    | `#ED699F` | Pink highlight                         |
| `bordo`   | `#60181F` | Burgundy highlight                     |

Plus the standard `neutral.50–950` scale.

### Typography
- Single font family: **Cousine** (loaded via `next/font/google` in `app/layout.tsx`), exposed as `--font-cousine` and aliased to both `font-regular` and `font-bold` in Tailwind. Don't introduce other fonts without designer input.
- The body baseline is `font-regular bg-marfim text-sombra` (see `app/layout.tsx`).

### Highlight component
Inline highlights use the `Highlight` component (`frontend/src/components/Highlight.tsx`), which renders a colored bar behind text. Allowed colors: `'rosa' | 'citrino' | 'bordo'`. Prefer this over inline `bg-*` for highlighted phrases.

```tsx
<Highlight color="citrino">Faça parte</Highlight>
```

### Logos & assets
Live in `frontend/public/`:
- `Logo-Horizontal.svg` / `Logo-Horizontal-White.svg` — full wordmark
- `Logo-Vertical.svg` — stacked logo (used on home hero)
- `So-Passaros.svg` — birds-only mark (used in compact navbar contexts and as favicon)
- `Passaro-Convite.svg`, `Fio-Rodape.svg` — decorative

### Email template
Edit **`email-template.mjml`** (the source). The `.html` output is compiled. Keep email styles consistent with brand tokens (`#1C1717`, `#FFFCEC`, `#ECCB2B`, etc.) and Georgia serif as the email font (intentional contrast with the web monospace).

## Domain Vocabulary (Portuguese)

The domain model is in Portuguese, both in code and DB. **Use these names verbatim** — do not anglicize them.

| Term         | Meaning                                         |
|--------------|-------------------------------------------------|
| `niusleter`  | A newsletter (publication)                      |
| `niusleteres`| Plural — the collection                         |
| `texto`      | A single newsletter post / issue                |
| `textos`     | The collection of posts                         |
| `inscrito`   | A subscriber                                    |
| `rodape`     | A reusable author bio / signature footer        |
| `convite`    | An invite request to join the platform          |
| `usuario`    | A user (newsletter author)                      |
| `caminho`    | URL slug for a niusleter or texto               |
| `casa`       | The author's dashboard ("home")                 |

Route paths follow the same convention: `/entrar`, `/solicitar-convite`, `/criar-texto`, `/casa`, `/[niusleter_path]/[text_path]`. Never introduce `/login`, `/signup`, `/dashboard`, etc.

Full schema details (fields, indexes, permissions) are in `DATABASE_SCHEMA.md` — **read it before touching migrations or queries**.

## Code Conventions

### Language
- **All code comments must be in Portuguese.** Match the existing tone (see `frontend/src/components/SanitizedHtml.tsx` for an example).
- **All commit messages must be in Portuguese.** See "Commits" below.
- UI strings are always in Portuguese (pt-BR).
- Variable / function names follow domain vocabulary above (Portuguese for domain concepts, English for generic technical helpers like `getPocketBaseFileUrl`).
- The `<html lang="pt-BR">` is set in `app/layout.tsx` — keep it.

### Comments
- **No narration comments.** Never write comments like `// moved this outside X so Y works` or `// fix: handle null case`. The code should just be correct. See `.cursor/rules/no-narration-comments.mdc`.
- Comments should explain *intent / trade-offs / non-obvious constraints*, not narrate what the code does.
- Skip obvious comments (`// import React`, `// return result`, etc.).

### Frontend
- App Router conventions; prefer Server Components, mark Client Components with `'use client'` only when needed (state, browser APIs, TipTap).
- Use the path alias `@/` (maps to `frontend/src/`).
- Use `next/image` and `next/link` (not raw `<img>` / `<a>`).
- Use the Tailwind brand tokens (`bg-marfim`, `text-sombra`, `bg-citrino`, etc.). Avoid arbitrary hex values.
- For user-generated HTML (e.g. newsletter body), **always render via `SanitizedHtml`** (which wraps DOMPurify). Never `dangerouslySetInnerHTML` raw user content.
- For URLs, use `new URL()` / `URLSearchParams`, not string concatenation.
- Follow the workspace Frontend Security rules (DOMPurify for HTML/SVG, no unsafe DOM APIs, validate URL schemes).

### Backend
- Code is organized as `backend/internal/<package>/`. Public functions in `internal/config` (e.g. `InitApp`, `registerHooksFromPackage`) are entry points.
- Hooks: register in `setup.go` via `registerHooksFromPackage`. Each hook lives in its own file under `internal/hooks/`.
- Migrations: PocketBase Go migrations, file name `<unix-timestamp>_<verb>_<noun>.go` (e.g. `1739834950_created_textos.go`, `1755034007_updated_inscritos.go`). Use `up`/`down` pairs.
- After schema changes, run `make squash-migrations` only when intentionally consolidating history.
- Dev superuser is auto-created on bootstrap (`dev@bemte.li` / `dev1234567`) when `APP_ENV=development`.

### Database schema changes
- The canonical reference is **`docs/DATABASE_SCHEMA.md`**.
- **Any change to a PocketBase collection (new collection, new/renamed/removed field, changed permissions, indexes, validators, etc.) must be reflected in `docs/DATABASE_SCHEMA.md` in the same change/PR as the migration.**
- If a migration touches a collection, update the collection's section: fields, indexes, permissions, relations. Don't leave the doc stale.
- Schema changes also typically warrant an OpenSpec proposal (see below) — the migration is the *implementation*, the spec is the *contract*.

## OpenSpec

This repo uses **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** for spec-driven development. OpenSpec is the source of truth for *what the system is supposed to do* before code is written. Config lives in `openspec/config.yaml`.

### Layout
- `openspec/specs/` — current, approved capability specs (the "how things are today")
- `openspec/changes/` — proposed or in-progress changes (delta against current specs)
- `openspec/changes/archive/` — completed/rejected changes

### When to use OpenSpec
Create or update an OpenSpec change proposal **before** (or alongside) implementation when the work involves any of:
- A new user-facing capability or flow (e.g. "subscriber double opt-in", "draft autosave", "newsletter analytics")
- Changes to the data model — **every PocketBase collection / migration change should have a spec update** (new collection, renamed field, new permission rule, etc.)
- Changes to public URLs, API endpoints, or email templates
- Anything where the *contract* matters more than the implementation detail

You can skip OpenSpec for purely internal refactors, copy tweaks, dependency bumps, dev-tooling changes, and single-file bug fixes that don't shift behavior.

### Workflow
1. **Propose** — add a change folder under `openspec/changes/<change-id>/` with the proposal, tasks, and any spec deltas. Keep proposals focused; if `rules` get defined in `openspec/config.yaml`, follow them.
2. **Implement** — write code and migrations. Update `docs/DATABASE_SCHEMA.md` for any schema-affecting work.
3. **Land the spec** — once shipped, fold the delta into `openspec/specs/` and move the change folder into `openspec/changes/archive/`.

When working on a feature, **read the relevant `openspec/specs/` file first** to understand the current contract, then check `openspec/changes/` for in-flight work that may collide with yours.

## Development Workflow

Use the `Makefile` — it wraps the right Docker Compose project for each environment.

| Command              | Purpose                                          |
|----------------------|--------------------------------------------------|
| `make dev`           | Start dev stack (frontend, pocketbase, smtp4dev) |
| `make down`          | Stop dev stack                                   |
| `make restart`       | Restart dev stack                                |
| `make logs`          | Tail all container logs                          |
| `make frontend-logs` | Tail frontend logs                               |
| `make backend-logs`  | Tail PocketBase logs                             |
| `make mail-logs`     | Tail mail server logs                            |
| `make clean`         | Wipe dev stack incl. `pb_data` (uses `sudo`)     |
| `make test`          | `npm test` + `go test ./...`                     |
| `make lint`          | `next lint` + `go vet ./...`                     |
| `make squash-migrations` | Squash PocketBase migrations history         |

Local URLs:
- Frontend: http://localhost:3030
- PocketBase admin: http://localhost:8090/_/
- Mail UI (smtp4dev): http://localhost:8025

Hot-reload works on both sides (Next.js dev server + Air for Go).

## Commits

**Commits are written in Portuguese.** Recent history mixes two styles — when in doubt, prefer Conventional Commits with a Portuguese subject:

Conventional, scoped (preferred for new work):
```
feat(frontend): editor de rodapé com TipTap e toolbar contextual
feat(editor): revamp completo da página criar-texto
refactor(rodape): migra rodapé de campos embutidos para coleção própria
```

Free-form Portuguese (also acceptable, common in older history):
```
melhorar navbar com titulo dinamico, logo clickavel e "Faça parte"
remove complexidade de setup local dev
```

Common scopes seen in this repo: `frontend`, `editor`, `rodape`, `backend`. Add new ones as needed.

### Critical commit rules
- **Never run `git commit` or `git push` directly.** Stage with `git add`, then give the user the full commit command to run themselves. See `~/.cursor/rules/no-direct-commits.mdc`.
- **Never commit `vibe-coding-docs/`.** That folder holds throwaway planning notes. See `~/.cursor/rules/vibe-coding-docs.mdc`.
- Do not commit `.env*` files (except `.env.example` if one exists), `pb_data/`, `tmp/`, `node_modules/`, or `*.log` (already in `.gitignore`).
- Don't commit files that look like secrets.

## When You're Stuck

- DB / collection question → `docs/DATABASE_SCHEMA.md`
- "What is the system supposed to do here?" → `openspec/specs/` (and `openspec/changes/` for in-flight work)
- Voice / tone / philosophy question → `Diário de borda.md` and `README.md`
- Brand / colors / typography → `frontend/tailwind.config.js` and `frontend/src/app/layout.tsx`
- Email styling → `email-template.mjml`
- Backend wiring → `backend/internal/config/setup.go`
