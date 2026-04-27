# Bemte.li Database Schema Documentation

## Overview
This document describes the current database schema for the Bemte.li project, based on the PocketBase migrations. The system consists of 6 main collections with various relationships and permissions.

## Collections

### 1. usuarios (Users Collection)
**Collection ID:** `_pb_users_auth_` (PocketBase built-in users collection)
**Table Name:** `usuarios`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `email` (email) - User email address
- Standard PocketBase auth fields (password, etc.)
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Indexes:**
- Unique index on `tokenKey`
- Unique index on `email` (where email is not empty)

**Permissions:**
- `listRule`: "" (public read access)
- `viewRule`: "" (public read access)
- `createRule`: Default PocketBase auth rules
- `updateRule`: Default PocketBase auth rules
- `deleteRule`: Default PocketBase auth rules

**OAuth2 Configuration:**
- No mapped fields for avatarURL or name

---

### 2. niusleteres (Newsletters Collection)
**Collection ID:** `pbc_niusleteres`
**Table Name:** `niusleteres`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `nome` (text) - Newsletter name (max 255 chars)
- `descricao` (editor) - Newsletter description/bio (HTML content)
- `foto` (file) - Newsletter logo/image
  - Accepted types: JPEG, PNG, SVG, GIF, WebP
  - Max select: 1 file
  - Thumbnails: 400x400px
- `caminho` (text, required) - URL path/slug for the newsletter
  - Pattern: `^[a-z0-9-]+$` (lowercase letters, numbers, hyphens only)
  - Max 255 chars
- `usuario` (relation) - Reference to usuarios collection
  - Max select: 1
  - Cascade delete: false
  - Required: true
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Indexes:**
- Unique index on `usuario` (enforces one-to-one relationship for now)
- Unique index on `caminho` (enforces unique newsletter paths)

**Permissions:**
- `listRule`: "" (public read access)
- `viewRule`: "" (public read access)
- `createRule`: null (admin only — onboarding deliberately curated)
- `updateRule`: `usuario = @request.auth.id` (the autor can update their own niusleter from `/casa/editar`)
- `deleteRule`: null (admin only)

**Note:** The unique constraint on `usuario` field enforces a one-to-one relationship between users and newsletters. This can be changed in the future to allow multiple newsletters per user.

---

### 3. rodapes (Footers Collection)
**Collection ID:** `pbc_rodapes`
**Table Name:** `rodapes`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `autor` (text) - Footer author name
- `descricao` (editor) - Footer description/bio (HTML content)
- `foto` (file) - Footer image
  - Accepted types: JPEG, PNG
  - Max select: 1 file
- `hash` (text, required) - Content hash for deduplication (12 chars, SHA256-based)
- `niusleter` (relation, required) - Reference to niusleteres collection
  - Max select: 1
  - Cascade delete: false
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Indexes:**
- Unique composite index on (`hash`, `niusleter`) - prevents duplicate rodapes per newsletter

**Permissions:**
- `listRule`: "" (public read access)
- `viewRule`: "" (public read access)
- `createRule`: null (admin only - managed automatically by backend hooks)
- `updateRule`: null (immutable - rodapes cannot be edited, only new ones created)
- `deleteRule`: null (admin only)

**Note:** Rodapes are immutable and deduplicated by content hash. When creating/updating a texto, the backend automatically finds or creates a matching rodape. Multiple textos can share the same rodape record, avoiding file duplication.

---

### 4. textos (Texts/Articles Collection)
**Collection ID:** `pbc_2443867158`
**Table Name:** `textos`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `titulo` (text) - Article title
- `corpo` (editor) - Article content (HTML)
- `enviado` (date) - Date when article was sent/published
- `caminho` (text, required) - URL path/slug
  - Pattern: `^[a-z0-9-]+$` (lowercase letters, numbers, hyphens only)
- `rodape` (relation) - Reference to rodapes collection
  - Max select: 1
  - Cascade delete: false
- `niusleter` (relation) - Reference to niusleteres collection
  - Max select: 1
  - Cascade delete: false
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Permissions:**
- `listRule`: "" (public read access)
- `viewRule`: "" (public read access)
- `createRule`: `niusleter.usuario = @request.auth.id` (autor can create textos for their own niusleter)
- `updateRule`: `niusleter.usuario = @request.auth.id` (autor can edit their own textos)
- `deleteRule`: `niusleter.usuario = @request.auth.id` (autor can delete their own textos)

**Note:** When creating/updating a texto via the API, you can send `rodape_autor`, `rodape_descricao`, and `rodape_foto` fields. A backend hook will automatically find or create the appropriate rodape record and set the relation.

---

### 5. inscritos (Subscribers Collection)
**Collection ID:** `pbc_1506696262`
**Table Name:** `inscritos`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `email` (email) - Subscriber email address
- `niusleter` (relation) - Reference to niusleteres collection (optional)
  - Max select: 1
  - Cascade delete: false
- `verificado` (date) - Date when subscription was verified
- `desinscrito` (date) - Date when user unsubscribed
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Indexes:**
- Unique composite index on (`email`, `niusleter`)

**Permissions:**
- `listRule`: `niusleter.usuario = @request.auth.id` (autor lists only their own inscritos)
- `viewRule`: `niusleter.usuario = @request.auth.id`
- `createRule`: null (subscription pipeline is hook-driven)
- `updateRule`: null (admin only)
- `deleteRule`: null (admin only)

---

### 6. convites (Invitations Collection)
**Collection ID:** `pbc_2261426176`
**Table Name:** `convites`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `email` (email, required) - Invitee email address
- `nome` (text, required) - Invitee name
- `sobre` (editor) - Information about the invitee
- `aprovada` (date) - Date when invitation was approved
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Indexes:**
- Unique index on `email`

**Permissions:**
- `createRule`: "" (public can create)
- All other rules: null (admin only)

## Relationships

### Primary Relationships:
1. **usuarios → niusleteres** (1:1, for now)
   - One user has one newsletter (enforced by unique constraint)
   - Field: `niusleteres.usuario`

2. **niusleteres → textos** (1:N)
   - One newsletter can have many texts
   - Field: `textos.niusleter`

3. **niusleteres → rodapes** (1:N)
   - One newsletter can have many rodapes (footer versions)
   - Field: `rodapes.niusleter`

4. **rodapes → textos** (1:N)
   - One rodape can be used by many texts
   - Field: `textos.rodape`

5. **niusleteres → inscritos** (1:N, optional)
   - One newsletter can have many subscribers
   - Field: `inscritos.niusleter`

### Relationship Diagram:
```
usuarios (1) ←→ (1) niusleteres
niusleteres (1) ←→ (N) textos
niusleteres (1) ←→ (N) rodapes
rodapes (1) ←→ (N) textos
niusleteres (1) ←→ (N) inscritos
```

## Rodape Deduplication System

The rodapes collection uses a content-based hash for automatic deduplication:

### How it works:
1. When a texto is created/updated with rodape data (`rodape_autor`, `rodape_descricao`, `rodape_foto`)
2. The backend hook computes a SHA256 hash of the content: `hash(autor|descricao|foto_filename)`
3. It searches for an existing rodape with the same hash for the same newsletter
4. If found: reuses the existing rodape (no duplication)
5. If not found: creates a new rodape record
6. The texto is linked to the rodape via the `rodape` relation

### Benefits:
- **No file duplication**: Same footer image is stored once, even if used by 100 texts
- **Automatic versioning**: Changing rodape content creates a new version
- **Historical preservation**: Old texts keep their original rodape
- **Transparent to clients**: API accepts rodape fields directly on texto, backend handles the rest

## Seeded Data

The database includes seeded data for a "Diário de borda" (Ship's Log) example:

### Test User:
- **Email:** `diario@bemte.li`
- **Password:** `dev123456` (development only)

### Test Newsletter:
- **Name:** `Diário de borda`
- **Description:** `Desenvolvendo um canto da Internet`
- **Path:** `diario-de-borda`
- **Owner:** Links to the test user above

### Test Article:
- **Title:** `Diário de borda #01`
- **Path:** `diario-de-borda-01`
- **Sent Date:** `2025-06-25T01:11:00Z`
- **Content:** Full HTML content about the Bemte.li project
- **Newsletter:** Links to the test newsletter above
- **Rodape:** Linked to a rodape record with author "Felipe, luana e Luccas"

## Security & Access Control

### Public Access:
- **usuarios**: Read-only access to user profiles (auth data only)
- **niusleteres**: Read-only access to newsletter profiles
- **textos**: Read-only access to published articles
- **rodapes**: Read-only access to footer content
- **convites**: Can create new invitation requests

### Autor Access (owner of a niusleter, authenticated via `usuarios`):
- **niusleteres**: `update` of their own niusleter (`usuario = @request.auth.id`)
- **textos**: `create`/`update`/`delete` of textos belonging to their niusleter (`niusleter.usuario = @request.auth.id`)
- **inscritos**: `list`/`view` of inscritos belonging to their niusleter (`niusleter.usuario = @request.auth.id`)

### Admin Only:
- **niusleteres**: Creation and deletion (onboarding stays curated)
- **inscritos**: `create`/`update`/`delete` (subscription pipeline is hook-driven)
- **rodapes**: Managed automatically by backend hooks (immutable)
- **convites**: Invitation approval/management

## Technical Notes

### PocketBase Configuration:
- Uses PocketBase's built-in authentication system
- Custom collection names in Portuguese
- File uploads supported for user photos and rodape images
- HTML content stored in editor fields
- Automatic timestamps on all collections

### Data Validation:
- URL paths must be lowercase with hyphens only
- Email uniqueness enforced where applicable
- Required fields enforced at database level
- File type restrictions on uploads
- Rodape hash uniqueness per newsletter enforced at database level

### Migration History:
- Schema evolved from basic collections to current structure
- Permission model refined over time
- Added unique constraints for data integrity
- Seeded with example content for development
- Footer data moved from embedded fields to separate rodapes collection with hash-based deduplication
