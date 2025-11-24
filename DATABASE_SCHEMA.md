# Bemte.li Database Schema Documentation

## Overview
This document describes the current database schema for the Bemte.li project, based on the PocketBase migrations. The system consists of 5 main collections with various relationships and permissions.

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
- `createRule`: null (admin only)
- `updateRule`: null (admin only)
- `deleteRule`: null (admin only)

**Note:** The unique constraint on `usuario` field enforces a one-to-one relationship between users and newsletters. This can be changed in the future to allow multiple newsletters per user.

---

### 3. textos (Texts/Articles Collection)
**Collection ID:** `pbc_2443867158`
**Table Name:** `textos`

**Fields:**
- `id` (text, primary key) - Auto-generated 15-character alphanumeric ID
- `titulo` (text) - Article title
- `corpo` (editor) - Article content (HTML)
- `enviado` (date) - Date when article was sent/published
- `caminho` (text, required) - URL path/slug
  - Pattern: `^[a-z0-9-]+$` (lowercase letters, numbers, hyphens only)
- `rodape_autor` (text) - Footer author name
- `rodape_descricao` (editor) - Footer description/content (HTML)
- `rodape_field` (file) - Footer image/attachment
  - Accepted types: JPEG, PNG
  - Max select: 1 file
- `niusleter` (relation) - Reference to niusleteres collection
  - Max select: 1
  - Cascade delete: false
- `created` (autodate) - Creation timestamp
- `updated` (autodate) - Last update timestamp

**Permissions:**
- `listRule`: "" (public read access)
- `viewRule`: "" (public read access)
- `createRule`: null (admin only)
- `updateRule`: null (admin only)
- `deleteRule`: null (admin only)

---

### 4. inscritos (Subscribers Collection)
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
- All rules: null (admin only access)

---

### 5. convites (Invitations Collection)
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

3. **niusleteres → inscritos** (1:N, optional)
   - One newsletter can have many subscribers
   - Field: `inscritos.niusleter`

### Relationship Diagram:
```
usuarios (1) ←→ (1) niusleteres
niusleteres (1) ←→ (N) textos
niusleteres (1) ←→ (N) inscritos
```

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
- **Footer Author:** `Felipe, luana e Luccas`
- **Footer Description:** `<a href="mailto:nos@bemte.li">nos@bemte.li</a>`

## Security & Access Control

### Public Access:
- **usuarios**: Read-only access to user profiles (auth data only)
- **niusleteres**: Read-only access to newsletter profiles
- **textos**: Read-only access to published articles
- **convites**: Can create new invitation requests

### Admin Only:
- **niusleteres**: Newsletter creation/editing
- **inscritos**: Full subscriber management
- **textos**: Article creation/editing (including embedded footer content)
- **convites**: Invitation approval/management

## Technical Notes

### PocketBase Configuration:
- Uses PocketBase's built-in authentication system
- Custom collection names in Portuguese
- File uploads supported for user photos and article footer images
- HTML content stored in editor fields
- Automatic timestamps on all collections

### Data Validation:
- URL paths must be lowercase with hyphens only
- Email uniqueness enforced where applicable
- Required fields enforced at database level
- File type restrictions on uploads

### Migration History:
- Schema evolved from basic collections to current structure
- Permission model refined over time
- Added unique constraints for data integrity
- Seeded with example content for development
- Footer data moved from separate collection to embedded fields in textos (simplified schema) 