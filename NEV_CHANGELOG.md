# NEV Database Changelog

All notable changes to the NEV Database system will be documented in this file.

## [1.0.0] - 2026-03-11 18:06 (Asia/Bangkok)

### Added
- **Admin Dashboard** (`/nev/admin`)
  - Overview statistics (brands, models, variants)
  - Powertrain breakdown (BEV/PHEV/HEV)
  - Price range and average range display
  - Recent activity section

- **Brand Management** (`/nev/admin/brands`)
  - List all brands with model counts
  - Search functionality
  - Display: name, Thai name, country, model count

- **Model Management** (`/nev/admin/models`)
  - List all models with brand and variant info
  - Search by model name or brand
  - Powertrain badges (BEV/PHEV/HEV)
  - Pagination (30 items per page)

- **Variant Management** (`/nev/admin/variants`)
  - List all variants with full specs
  - Search by name, brand, or model
  - Display: price, battery, range, HP, drivetrain
  - Pagination (30 items per page)

- **Backend APIs**
  - `/api/nev/stats` - Real-time statistics from database
  - `/api/nev/admin/brands` - Brand CRUD with pagination
  - `/api/nev/admin/brands/[id]` - Single brand operations
  - API caching: 5min cache, 10min stale-while-revalidate

- **Audit System**
  - Track all CREATE/UPDATE/DELETE operations
  - Log: who, what, when, changes (before/after)
  - Store in `NevAuditLog` table

- **Database**
  - Supabase PostgreSQL (Singapore region)
  - 32 brands, 113 models, 210 variants
  - Prisma ORM with full type safety

### Technical
- Stack: Next.js 16, React 19, TypeScript, Prisma
- Deploy: Vercel production
- Git: Automated version control
- Cache: CDN + API response caching

---

## Version Format
MAJOR.MINOR.PATCH (Semantic Versioning)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes
