# NEV Database Changelog

All notable changes to the NEV Database system will be documented in this file.

## [1.1.0] - 2026-03-11 19:00 (Asia/Bangkok)

### Added
- **Edit Variant Page** (`/nev/admin/variants/[id]`)
  - Full form with all specs
  - Save → Update database
  - Audit logging
  
- **Import System** (`/nev/admin/import`)
  - URL import (fetch + AI parse)
  - File upload (drag & drop)
  - Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
  
- **AI Parsing (GLM-5)**
  - Extracts specs from documents automatically
  - Creates brand/model/variant if not exists
  - Preview before confirm
  
- **Image → WebP Conversion**
  - Auto-converts JPG/PNG to WebP
  - Quality optimization (80%)

- **Dependencies Added**
  - sharp (image processing)
  - pdf-parse (PDF extraction)
  - mammoth (DOCX parsing)
  - xlsx (Excel parsing)

## [1.0.1] - 2026-03-11 18:20 (Asia/Bangkok)

### Fixed
- **Battery data corrected** - All variants now show accurate battery capacity
  - Was showing 8 kWh for all variants
  - Now shows correct values (e.g., BYD Seal: 61.4, 82.5 kWh)
- **Parser V2 improved** - More specific field matching
  - Search for "ขนาดแบตเตอรี่ (kWh)" instead of generic "แบตเตอรี่"
  - Prevents matching header rows

### Added
- **Edit functionality** in variants management
  - Variant names are now clickable links
  - Edit button in each row
  - Links to `/nev/admin/variants/[id]` for editing

### Changed
- Re-imported 206 variants with correct data (was 210)
  - Removed 4 variants without battery data

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
