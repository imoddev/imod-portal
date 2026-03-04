# iMoD Portal - Development Knowledge Base

## 📋 Project Overview

**iMoD Internal Portal** เป็นระบบหลังบ้านสำหรับ iMoD Team ใช้จัดการงาน, บุคลากร, และ workflow ภายใน

- **URL Development:** http://localhost:3000
- **URL Production:** https://basement.iphonemod.net (planned)
- **Tech Stack:** Next.js 15, Prisma 6, SQLite (dev) / PostgreSQL (prod), shadcn/ui, Tailwind CSS

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (dashboard)/       # Protected routes (ต้อง login)
│   │   ├── dashboard/     # หน้าแรก
│   │   ├── hr/           # ระบบ HR (ลา/OT/เบี้ยเลี้ยง)
│   │   ├── team/         # Team Directory
│   │   ├── timesheet/    # บันทึกเวลาทำงาน
│   │   ├── assets/       # จัดการอุปกรณ์
│   │   ├── content/      # Content Hub + News DB
│   │   ├── calendar/     # ปฏิทินทีม
│   │   ├── analytics/    # Content Analytics
│   │   ├── report/       # Reports & Payroll
│   │   └── ...
│   ├── api/              # API Routes
│   └── auth/             # NextAuth routes
├── components/
│   ├── ui/               # shadcn/ui components
│   └── layout/           # App layout (sidebar, etc.)
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── wordpress.ts      # WordPress API helper
│   └── wordpress-post.ts # WordPress post helper
└── ...
```

---

## 🗄️ Database Schema

### Core Tables
- `User` - ผู้ใช้ระบบ (NextAuth)
- `Employee` - ข้อมูลพนักงาน (Team Directory)
- `Attendance` - บันทึกเข้า-ออกงาน

### HR Tables
- `LeaveBalance` - วันลาคงเหลือ
- `LeaveRequest` - คำขอลา
- `OvertimeRequest` - คำขอ OT
- `AllowanceRequest` - คำขอเบี้ยเลี้ยง

### Content Tables
- `NewsItem` - ข่าวจาก RSS/Sheet
- `ContentPlan` - แผนคอนเทนต์ (Editorial Calendar)

### Asset Tables
- `Asset` - อุปกรณ์
- `AssetBorrowing` - ประวัติยืม/คืน

### System Tables
- `Comment` - ความคิดเห็น
- `Template` - เทมเพลตการเขียน
- `AuditLog` - ประวัติการใช้งาน

---

## 🔌 API Endpoints

### HR APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/hr/leave` | คำขอลา |
| PATCH | `/api/hr/leave/[id]` | อนุมัติ/ปฏิเสธ |
| GET/POST | `/api/hr/overtime` | คำขอ OT |
| GET/POST | `/api/hr/allowance` | เบี้ยเลี้ยง |
| GET | `/api/hr/balance` | วันลาคงเหลือ |
| GET | `/api/hr/summary` | สรุปประจำเดือน |

### Team APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/team` | พนักงาน |
| GET/POST | `/api/timesheet` | Check in/out |

### Content APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/news` | ข่าว |
| POST | `/api/news/assign` | มอบหมายข่าว |
| GET/POST | `/api/content-calendar` | แผนคอนเทนต์ |

### Asset APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/assets` | อุปกรณ์ |
| POST | `/api/assets/borrow` | ยืม/คืน |

### Analytics APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/content` | วิเคราะห์คอนเทนต์ |
| GET | `/api/analytics/writer` | วิเคราะห์นักเขียน |
| GET | `/api/analytics/sources` | วิเคราะห์แหล่งข่าว |

### Automation APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cron/fetch-news` | ดึงข่าว RSS อัตโนมัติ |
| POST | `/api/webhook/publish` | Webhook เมื่อ publish |
| POST | `/api/notifications` | ส่งแจ้งเตือน |

---

## 🔄 Workflows

### 1. HR Flow - คำขอลา
```
พนักงานส่งคำขอ → บันทึก DB (pending) → แจ้ง Discord #revenue-team
     ↓
Admin ไป /hr/admin → อนุมัติ/ไม่อนุมัติ
     ↓
อัปเดต status → แจ้งผล Discord → หักวันลา (ถ้าอนุมัติ) → แสดงใน Calendar
```

### 2. News Flow
```
RSS Cron ดึงข่าว → บันทึก NewsItem → แจ้ง Discord ตามทีม (IT/EV)
     ↓
Writer claim ข่าว → status: claimed → ไปหน้า My Tasks
     ↓
เขียน Draft → status: drafting → ส่ง Review
     ↓
Publish → status: published → แจ้ง Discord + Short URL
```

### 3. Asset Flow
```
Admin เพิ่มอุปกรณ์ → status: available
     ↓
ยืม → สร้าง AssetBorrowing → status: in-use
     ↓
คืน → อัปเดต returnDate → status: available
```

---

## 🎨 UI/UX Guidelines

### iMoD CI Colors
- Primary: `#ED2887` (Pink)
- Secondary: `#612BAE` (Purple)
- Gradient: Pink → Purple

### Theme
- Dark theme เป็น default
- ใช้ `[color-scheme:dark]` สำหรับ native inputs

### Components
- ใช้ shadcn/ui components
- Tabs สำหรับแบ่งหมวด
- Cards สำหรับ summary
- Tables สำหรับ data lists

---

## 🔐 Security

### Authentication
- Google OAuth via NextAuth v5
- JWT sessions (Edge Runtime compatible)
- Domain allowlist: @modmedia.asia

### Authorization
- Roles: admin, manager, lead, member
- Role-based access (planned)
- Audit logging ทุก action

---

## 📁 Key Files

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/prisma.ts` | Prisma client |
| `src/lib/wordpress.ts` | WordPress API |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout |
| `src/components/layout/app-sidebar.tsx` | Sidebar menu |

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production (planned)
```bash
# Build
npm run build

# Database migration
npx prisma migrate deploy

# Start
npm start
```

### VPS Info
- Host: ipm.iphonemod.net
- User: iphonemod
- Domain: basement.iphonemod.net

---

## 📝 Future Improvements

1. **Google Calendar Sync** - ดึงนัดจาก Google Calendar
2. **PWA** - Install บนมือถือ
3. **Real-time Notifications** - WebSocket
4. **Advanced RBAC** - Fine-grained permissions
5. **Data Export** - Excel/PDF reports

---

*Last updated: 4 มีนาคม 2569*
