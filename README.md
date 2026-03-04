# 🏢 iMoD Internal Portal

> Internal System สำหรับทีม Mod Media Co., Ltd.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🔑 Environment Variables

สร้างไฟล์ `.env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# YouTube API (optional)
YOUTUBE_API_KEY="your-youtube-api-key"
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Protected pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── activity/      # Activity log
│   │   ├── content/       # Content hub + News DB
│   │   ├── youtube/       # YouTube analytics
│   │   ├── revenue/       # Sales CRM
│   │   ├── ratecard/      # Rate card viewer
│   │   ├── production/    # Production board
│   │   ├── calendar/      # Calendar
│   │   └── admin/         # Admin pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # App layout (sidebar)
├── lib/
│   ├── auth/              # NextAuth config
│   ├── db/                # Prisma client
│   ├── wordpress.ts       # WordPress API
│   ├── youtube.ts         # YouTube API
│   └── team-data.ts       # Team members data
├── types/                 # TypeScript types
└── prisma/                # Database schema
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma 7
- **Auth:** NextAuth v5 + Google OAuth
- **Language:** TypeScript

## 📖 Documentation

- [Development Guide](./docs/DEVELOPMENT.md)
- [Changelog](./docs/CHANGELOG.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 👥 Team

- **Project Owner:** พี่ต้อม (Tom)
- **Development:** Lucus #001 (AI)
- **Requirements:** Marcus, Luna, Maxus

## 📝 License

Private - Mod Media Co., Ltd.
