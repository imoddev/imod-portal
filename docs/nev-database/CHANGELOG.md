# NEV Database Changelog

All notable changes to the NEV Database feature will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-beta.1] - 2026-03-11

### Added

#### Database Schema
- `NevBrand` - ตาราง Brand รถยนต์ (32 brands)
- `NevModel` - ตารางรุ่นรถหลัก (165 models)
- `NevVariant` - ตารางรุ่นย่อยพร้อมสเปก (246 variants)
- `NevDataVersion` - ติดตาม version ข้อมูล
- `NevAuditLog` - บันทึกการแก้ไขข้อมูล

#### Features
- Schema รองรับทุก powertrain: BEV, PHEV, HEV, REEV, ICE
- รองรับข้อมูล PHEV (engine cc, fuel tank, combined hp)
- V2L/V2G tracking
- Warranty tracking (vehicle & battery)
- Data source tracking (excel, manual, api)
- Audit logging สำหรับ version control

### Technical Notes
- Integrated into iMoD Portal (Next.js 15 + Prisma 7)
- Database: Supabase PostgreSQL
- Auth: Reuse existing NextAuth system

### Data Source
- Excel: `/Volumes/Video_Creator/สเปคชีตรถ/Master-NEV-Database-2026.xlsx`
- Last updated: 27 Feb 2026

---

## Roadmap

### [1.0.0-beta.2] - Planned
- [ ] Migration script from Excel
- [ ] Basic API endpoints
- [ ] Admin UI for CRUD

### [1.0.0-rc.1] - Planned
- [ ] Search & filter UI
- [ ] Compare feature (2-4 cars)
- [ ] Public API for iMoD/EVMoD

### [1.0.0] - GA
- [ ] Full production release
- [ ] Mobile responsive
- [ ] Export (PDF, Excel, JSON)

---

## Contributors
- **Developer:** AJ White (Lucus #008)
- **Data Source:** พี่ต้อม / ทีม EVMoD
- **Review:** -

---

_Last updated: 2026-03-11 11:52 GMT+7_
