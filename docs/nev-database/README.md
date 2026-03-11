# NEV Database

> ฐานข้อมูลรถยนต์ไฟฟ้าและพลังงานใหม่ที่จำหน่ายในประเทศไทย

**Version:** 1.0.0-beta.1  
**Status:** Development  
**Developer:** AJ White (Lucus #008)

---

## Overview

NEV Database เป็นส่วนหนึ่งของ iMoD Portal สำหรับจัดเก็บและจัดการข้อมูลรถยนต์ไฟฟ้าและพลังงานใหม่ที่จำหน่ายในประเทศไทย

### Statistics (as of Feb 2026)
| Metric | Count |
|--------|-------|
| Brands | 32 |
| Models | 165 |
| Variants | 246 |
| BEV | 177 |
| PHEV | 14 |
| HEV | 22 |
| REEV | 4 |
| ICE | 29 |

---

## Database Schema

```
NevBrand (1) ─────────< NevModel (N)
                            │
                            └────< NevVariant (N)
```

### Tables

#### NevBrand
- Brand info (name, logo, country)
- Stats (total models)

#### NevModel
- Model info (name, year, body type)
- Powertrain type (BEV, PHEV, HEV, REEV, ICE)
- Assembly (CKD, CBU)
- Media (images, YouTube)

#### NevVariant
- Full specifications
- Pricing
- Battery & range
- Motor & performance
- Charging specs
- PHEV engine specs
- Dimensions
- Warranty
- Features (JSON)

#### NevDataVersion
- Version tracking
- Import history

#### NevAuditLog
- Change tracking
- Who changed what when

---

## API Endpoints (Planned)

```
GET  /api/nev/brands              - List all brands
GET  /api/nev/brands/:slug        - Get brand with models
GET  /api/nev/models              - List/search models
GET  /api/nev/models/:slug        - Get model with variants
GET  /api/nev/variants/:id        - Get variant details
GET  /api/nev/compare?ids=1,2,3   - Compare variants
GET  /api/nev/search?q=BYD        - Search
GET  /api/nev/stats               - Dashboard stats
```

---

## UI Pages (Planned)

```
/nev-database                     - Dashboard
/nev-database/brands              - Brand list
/nev-database/brands/:slug        - Brand detail
/nev-database/models/:slug        - Model detail
/nev-database/compare             - Compare tool
/nev-database/search              - Search
/nev-database/admin               - Admin CRUD (role-based)
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full CRUD + Import |
| Editor | Create + Update |
| Viewer | Read only |

---

## Data Source

- **Excel:** `/Volumes/Video_Creator/สเปคชีตรถ/Master-NEV-Database-2026.xlsx`
- **Format:** 34 sheets (1 dashboard + 32 brands + 1 YouTube index)
- **Structure:** Columns = variants, Rows = specs

---

## Development

### Run Migration
```bash
cd /Users/imodteam/projects/imod-portal
npx prisma migrate dev --name add-nev-database
npx prisma generate
```

### Import Data
```bash
# Coming in beta.2
npm run nev:import
```

---

## Files

```
/docs/nev-database/
├── README.md           # This file
├── CHANGELOG.md        # Version history
└── MIGRATION.md        # Migration guide (planned)

/app/nev-database/      # UI pages (planned)
/app/api/nev/           # API routes (planned)
/scripts/nev/           # Import scripts (planned)
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

---

_Created: 2026-03-11 by AJ White_
