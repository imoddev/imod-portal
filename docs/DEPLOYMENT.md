# 🚀 Deployment Guide

## Development (Local)

### Prerequisites
- Node.js 22+
- npm or pnpm

### Setup
```bash
# Clone or navigate to project
cd /Users/imodteam/projects/imod-portal

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Create .env.local with credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Keep Server Running
```bash
# Background mode (survives terminal close)
nohup npm run dev > /tmp/imod-portal.log 2>&1 &

# Check logs
tail -f /tmp/imod-portal.log

# Stop server
pkill -f "next dev"
```

---

## Production Options

### Option 1: Vercel (Recommended)

**Pros:**
- Zero config deployment
- Auto SSL, CDN
- Serverless functions
- GitHub integration

**Setup:**
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

**Environment Variables (Vercel Dashboard):**
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Note:** Change database to PostgreSQL for production

---

### Option 2: VPS (ipm.iphonemod.net)

**Server Info:**
- OS: Debian 12 (bookworm)
- RAM: 11GB
- CPU: 4 cores
- PHP: 8.4 (installed)
- Node.js: Not installed (needs setup)

**SSH Access:**
```bash
ssh iphonemod@ipm.iphonemod.net -p 22
```

**Setup Node.js:**
```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v
npm -v
```

**Deploy:**
```bash
# Clone project
cd /var/www
git clone <repo-url> imod-portal
cd imod-portal

# Install dependencies
npm ci --production

# Build
npm run build

# Setup PM2
sudo npm install -g pm2
pm2 start npm --name "imod-portal" -- start
pm2 save
pm2 startup
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name basement.iphonemod.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d basement.iphonemod.net
```

---

### Option 3: Docker

**Dockerfile:**
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/imod_portal
      - NEXTAUTH_URL=https://basement.iphonemod.net
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
  
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=imod_portal
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

volumes:
  postgres_data:
```

---

## Database Migration (SQLite → PostgreSQL)

**1. Update schema:**
```prisma
datasource db {
  provider = "postgresql"
}
```

**2. Update .env:**
```
DATABASE_URL="postgresql://user:password@host:5432/imod_portal"
```

**3. Migrate:**
```bash
npx prisma migrate deploy
```

---

## Google OAuth Production Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add production redirect URI:
   ```
   https://basement.iphonemod.net/api/auth/callback/google
   ```
3. Update `NEXTAUTH_URL` to production URL

---

## Checklist

### Before Deploy
- [ ] Change `NEXTAUTH_SECRET` to secure random string
- [ ] Update `NEXTAUTH_URL` to production URL
- [ ] Add production redirect URI in Google Console
- [ ] Switch to PostgreSQL
- [ ] Test all features locally

### After Deploy
- [ ] Verify OAuth login works
- [ ] Check WordPress API connections
- [ ] Test all pages
- [ ] Setup monitoring (optional)
- [ ] Setup backup (database)

---

## Troubleshooting

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Database issues:**
```bash
npx prisma migrate reset
npx prisma generate
```

**Auth not working:**
- Check `NEXTAUTH_URL` matches actual URL
- Check redirect URIs in Google Console
- Check `NEXTAUTH_SECRET` is set

**WordPress API failing:**
- Check network connectivity
- API might be rate limited
- Cache might be stale
