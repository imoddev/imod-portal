# 📜 Changelog

All notable changes to this project will be documented in this file.

---

## [0.1.0] - 2026-03-03

### 🎉 Initial Release

**Foundation**
- Next.js 15 + TypeScript project setup
- Tailwind CSS v4 + shadcn/ui components
- SQLite database with Prisma ORM
- Google OAuth authentication (NextAuth v5)
- Responsive sidebar navigation
- Protected routes with middleware

**Dashboard**
- Overview statistics cards
- Real-time articles from WordPress API (iMoD + EV)
- Today's article count
- Recent activities section

**Activity Log**
- Activity type selection (article, video, shooting, etc.)
- Title and description input
- Today's activities list
- Time-based display

**Content Hub**
- Articles from iPhoneMod.net
- Articles from ev.iphonemod.net
- Thumbnail, author, date display
- External link to original article

**News Dashboard**
- News items list with status
- Claim system (available → claimed → drafting → published)
- Category and status filters
- Search functionality
- Statistics cards

**YouTube Analytics**
- Recent videos display
- View, like, comment counts
- Duration formatting
- Mock data (ready for API integration)
- Top performing videos ranking

**Revenue Dashboard**
- Lead pipeline visualization
- Lead list with company, contact, value
- Status badges (new, contacted, proposal, negotiation, won, lost)
- Follow-up date tracking
- Pipeline value calculation

**Rate Card**
- IT Gadget, Automotive, Energy cards
- Google Slides links
- Short URL copy functionality
- Pricing overview

**Production Board**
- Kanban-style board (Backlog, In Progress, Review, Done)
- Task cards with priority badges
- Assignee and due date
- Add new task functionality
- Statistics overview

**Calendar**
- Monthly calendar view
- Event types (meeting, shooting, deadline, event)
- Color-coded events
- Selected date events sidebar
- Upcoming events (7 days)

**Team Management**
- Team members list from team-data.ts
- Department filter
- Search functionality
- Role badges (admin, manager, member)
- Edit/delete buttons (UI only)

**Settings**
- Public signup toggle
- Allowed emails management
- Allowed domains display
- Integration status cards
- Save functionality (UI only)

### 🔧 Technical
- Prisma schema for User, Activity, Lead, Project, NewsItem
- WordPress API integration (lib/wordpress.ts)
- YouTube API integration (lib/youtube.ts)
- Team data structure (lib/team-data.ts)
- Auth configuration (lib/auth/config.ts)

### 📝 Documentation
- README.md with quick start guide
- DEVELOPMENT.md with progress tracking
- CHANGELOG.md (this file)

---

## [Unreleased]

### Planned
- Database persistence for all features
- Google Sheets integration for News DB
- YouTube API with real credentials
- User management (add/edit/remove)
- Quotation generator
- Draft generator with AI
- Discord notifications
- PostgreSQL for production
