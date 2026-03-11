# NEV Database Changelog

All notable changes to the NEV Database system will be documented in this file.

## [1.4.1] - 2026-03-11 20:45 (Asia/Bangkok)

### Bug Fixes & Features 🔧

**Fixed:**
- **Worker Import Error** 🐛
  - Error: `Cannot find module '../src/lib/nev-import-helpers'`
  - Created: `nev-import-helpers-node.js` (pure Node.js version)
  - Worker now imports correctly (no TypeScript/Next.js dependency)

**Added:**
- **Manual Info Fields** (Optional)
  - Brand, Model, Variant input fields
  - AI auto-extracts if not provided
  - Useful when AI extraction fails or for accuracy
  
- **Re-upload Option**
  - Checkbox: "อัปโหลดเพิ่มไปยัง batch เดิม"
  - Enter existing Batch ID
  - Append files to same batch
  - **Use case:** When files are too many for single upload (>10 files limit)

**UI Improvements:**
- Manual info grid (3 fields: Brand, Model, Variant)
- Re-upload checkbox + Batch ID input
- Help text: "AI จะแยกข้อมูลให้อัตโนมัติ"
- Better form layout and spacing

**Backend:**
- FormData now includes: brand, model, variant, existingBatchId
- Mac Studio server restarted with fixes
- Worker uses pure Node.js modules

## [1.4.0] - 2026-03-11 20:30 (Asia/Bangkok)

### Discord Thread Progress Updates 📊

**Added:**
- **Discord Thread per Import** (เหมือน Long to Short)
  - สร้าง thread ใหม่ทุกครั้งใน channel `1478707742603612241`
  - Thread name: `🚗 NEV Import: batch-{timestamp}`
  
- **Step-by-Step Progress:**
  1. ✅ 1/6 อัปโหลดไฟล์เสร็จ (X ไฟล์, Y MB)
  2. 🔄 2/6 กำลัง parse ไฟล์ (1/X, 2/X, ...)
  3. ✅ 3/6 AI extract specs เสร็จ
  4. ✅ 4/6 Merge specs เสร็จ
  5. 🔄 5/6 กำลังบันทึกลง database
  6. ✅ 6/6 เสร็จสิ้น! (พร้อม link ไปดูรถ)
  
- **Final Message:**
  - รายละเอียดรถ: Brand, Model, Variant
  - ราคา, แบตเตอรี่, ระยะทาง
  - Link: `/nev/admin/variants/{id}`
  - ใช้เวลา: X วินาที

**Changed:**
- ไม่ส่ง DM อีกต่อไป → ใช้ thread แทน
- Real-time updates ระหว่าง processing

**Benefit:**
- ดู progress ได้แบบ real-time
- ไม่ต้องรอเสร็จถึงรู้ว่าทำอะไรอยู่
- Thread ไม่รบกวน channel หลัก

## [1.3.0] - 2026-03-11 19:55 (Asia/Bangkok)

### Architecture Change 🏗️
**Vercel → Mac Studio → AI Processing**

**Added:**
- **NEV Import Server** (Mac Studio, Port 3200)
  - Express.js HTTP server
  - Receives files from Vercel
  - Saves to `/tmp/nev-import/batch-{timestamp}/`
  - Triggers AI worker asynchronously
  
- **NEV Import Worker** (Background AI)
  - PDF parsing ✅ (works on Mac Studio!)
  - DOC/DOCX, XLS/XLSX, Images ✅
  - AI extract specs (GLM-5)
  - Merge specs from multiple files
  - Save to database
  - Discord notification (ID: 1478707742603612241)
  
- **Cloudflare Tunnel**
  - nev-import.iphonemod.net → localhost:3200
  - Tunnel: `imod-nev-import` (49a023d7)
  - PM2: `cf-nev-import`, `nev-import-server`

**Benefits:**
- ✅ All file formats supported (PDF works!)
- ✅ Fast response (async processing)
- ✅ Discord notifications when complete
- ✅ No serverless limitations

**Workflow:**
1. User uploads files → Vercel
2. Vercel forwards → Mac Studio (https://nev-import.iphonemod.net)
3. Mac Studio saves files + triggers AI worker
4. AI worker processes in background
5. Discord notification when done

## [1.2.0] - 2026-03-11 19:20 (Asia/Bangkok)

### Added
- **Multi-file Batch Import** (สูงสุด 10 ไฟล์ต่อครั้ง)
  - อัปโหลดหลายไฟล์พร้อมกัน
  - แสดงรายการไฟล์ + ขนาด
  - Progress indicator ระหว่างประมวลผล
  
- **Batch Processing Workflow**
  1. บันทึกไฟล์ไปที่ `/tmp/nev-import/batch-{timestamp}/`
  2. AI parse แต่ละไฟล์ → Extract specs
  3. รวมข้อมูลจากทุกไฟล์
  4. AI วิเคราะห์และ merge specs อีกครั้ง (resolve conflicts)
  5. บันทึกลง database
  
- **Batch API** (`/api/nev/admin/import/batch`)
  - รองรับ FormData multi-file
  - Individual file parsing
  - AI-powered spec merging
  - Batch metadata (file count, batch ID)

### Fixed
- Deprecated export config warning
- Type error: setFile → setFiles

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
