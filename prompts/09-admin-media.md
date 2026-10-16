# 09 — Admin panel and image uploads (агенты: architect → backend-dev → frontend-dev → security-reviewer)

```
Build the admin panel and media pipeline for krishki.uz. Load skills krishki-domain, krishki-backend, krishki-security, krishki-3d, krishki-design-system, krishki-qa. First use the architect agent to write docs/adr/0005-admin-and-media.md and docs/plans/admin-media.md, then stop for my approval. After approval: backend-dev builds the API and storage, frontend-dev builds the admin UI, threed-dev wires textures into the lid wall, security-reviewer reviews before merge.

GOAL
Non-technical factory staff can log in, upload and replace images, edit the 50 lid designs, partners, gallery and page texts in ru/uz/en, manage leads, and see changes on the public site within 60 seconds without a redeploy.

ARCHITECTURE
- Admin UI: Next.js route group apps/web/app/(admin)/admin, served at /admin (or admin.krishki.uz), never indexed (noindex header, excluded from sitemap and robots allow).
- Admin API: FastAPI router /v1/admin/*, all endpoints require an authenticated session and a role check.
- Storage: S3-compatible bucket (Cloudflare R2 or MinIO in docker-compose for staging). Two prefixes: originals/ (private) and public/ (served via CDN). Config through env: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, CDN_BASE_URL.
- Public site keeps rendering statically; after every publish the API calls a Next.js revalidation endpoint (POST /api/revalidate with REVALIDATE_SECRET) using revalidateTag per entity: lids, partners, gallery, content, settings.

DATA MODEL (Alembic migrations)
- admins: id, email unique, password_hash (argon2id), role (owner|editor), totp_secret encrypted, is_active, last_login_at, created_at.
- sessions: id, admin_id, token_hash, expires_at, ip_hash, user_agent.
- media: id uuid, kind (lid_texture|photo|partner_logo|og_image|document), original_key, mime, width, height, bytes, sha256 unique, alt {ru,uz,en}, focal_point_x/y, variants jsonb {webp_400, webp_800, webp_1600, avif_800, avif_1600, blur_data_url}, created_by, created_at, deleted_at (soft delete).
- lid_designs: id, slug unique, type (sko|twist_off), line, name {ru,uz,en}, diameter_mm, colors[], inside_lacquer, is_new, private_label_example, texture_media_id, photo_media_id, sort_order, status (draft|published), updated_by, updated_at.
- partners: id, name, logo_media_id, url, sort_order, status.
- gallery_items: id, section (factory|production|products), media_id, caption {ru,uz,en}, sort_order, status.
- content_blocks: key (e.g. home.hero.title), value {ru,uz,en}, reviewed {ru,uz,en} booleans, updated_by, updated_at.
- settings: phones, emails, address {ru,uz,en}, social links, telegram usernames.
- audit_log: id, admin_id, action, entity, entity_id, diff jsonb, at.
Seed lid_designs, partners and content_blocks from content/lids.json and messages/*.json so nothing is lost.

IMAGE UPLOAD PIPELINE
1. Browser asks POST /v1/admin/media/upload-url with kind, filename, size, mime; API validates role, size limit (photos 15 MB, textures 20 MB, logos 2 MB) and allowed types (jpeg, png, webp; svg only for partner_logo).
2. Browser uploads directly to originals/ using a presigned PUT URL (expires in 5 minutes, content-type and content-length locked).
3. Browser calls POST /v1/admin/media/complete; the API downloads the object and processes it in a background worker (arq or Celery with Redis):
   - verify real type by magic bytes, reject mismatches; reject images above 40 megapixels (decompression bomb guard);
   - strip EXIF and GPS, apply EXIF orientation, convert to sRGB;
   - SVG: sanitize (remove scripts, event handlers, external refs, foreignObject) or rasterize to PNG; serve with Content-Type image/svg+xml and Content-Security-Policy sandbox;
   - generate variants with pyvips (fallback Pillow): WebP 400/800/1600, AVIF 800/1600, a 16 px blur placeholder;
   - compute sha256 and return the existing media row if the same file was already uploaded;
   - lid_texture only: require square input at least 1024 px, provide a circular crop step in the UI, output 1024x1024 WebP and a KTX2 (toktx/basisu) for the 3D wall, then rebuild the 8x8 texture atlas and its UV map JSON, upload to public/atlas/ with a content hash in the filename.
4. Media status (processing|ready|failed) is polled by the UI; failures show a human-readable reason.
5. Public site uses next/image with a custom loader pointing to CDN_BASE_URL variants, width/height always set, blur placeholder, alt from the current locale.

ADMIN UI (Russian interface, desktop and tablet first, usable on phone)
- Login with email + password, then TOTP 2FA for every admin; "forgot password" only by owner reset, no public email reset.
- Dashboard: new leads count by direction, last edits from audit_log, storage usage.
- Leads: table with filters (direction, status, date, language), lead card, status change, notes, CSV export; owner only can delete.
- Lid designs (the 50 block): grid of cards with the texture preview on a rendered lid, drag-and-drop sort order, create/edit form with all fields and three language tabs, texture upload with circular crop, draft/publish, live preview of how the lid looks in the wall.
- Media library: grid, search by alt and kind, drag-and-drop multi-upload with progress, set alt texts in three languages, focal point picker, "where is this used" list, soft delete blocked while the image is in use.
- Partners, Gallery: list with drag-and-drop sorting, upload, publish toggle.
- Texts: content_blocks grouped by page and section, side-by-side ru/uz/en editing, "translate draft" button calling the stage-2 translation service and marking the result reviewed=false, character counters for title/description fields.
- Settings: contacts and social links (owner only), admin users and roles (owner only).
- Every save writes audit_log and triggers revalidation; show "Опубликовано на сайте" after revalidation succeeds.
- Use our design-system tokens; the admin is calm and functional, no 3D, no decorative motion.

SECURITY (follow krishki-security, plus)
- Sessions: random 256-bit token, stored hashed, httpOnly + Secure + SameSite=Strict cookie, 8 h idle timeout, 7 d absolute, rotate on login and privilege change; logout everywhere button.
- CSRF: double-submit token on every state-changing request.
- Login: rate limit 5 attempts per 15 min per account and per ip_hash, generic error messages, lockout notice to the owner's Telegram.
- Roles: editor can edit content, media, lids and leads status; owner additionally manages admins, settings, deletions and CSV export. Enforce on the API, not only in the UI.
- Optional IP allowlist for /admin in Caddy (ADMIN_ALLOWED_IPS env).
- Bucket: originals/ private, public/ read-only; no listing; CORS on the bucket only for the admin origin and PUT.
- Never trust filenames: generate object keys as {kind}/{yyyy}/{mm}/{uuid}.{ext}.
- Audit log is append-only for the app role.

TESTS AND DONE
- pytest: auth and 2FA flow, session expiry, CSRF rejection, role enforcement on every admin endpoint, upload with wrong magic bytes, oversized file, decompression bomb, malicious SVG, duplicate sha256, atlas rebuild, revalidation call.
- Playwright: login with TOTP, upload a lid texture with crop, publish, see it on /ru/designs within 60 s; edit a uz text and see it on /uz; editor cannot open settings.
- security-reviewer report with no Critical or High findings.
- docs/admin-guide-ru.md: short illustrated guide for factory staff (how to log in, add a lid design, replace a photo, answer a lead).
```
