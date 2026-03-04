# 🔌 API Documentation

## External APIs Used

### WordPress REST API

**iPhoneMod.net**
```
Base URL: https://www.iphonemod.net/wp-json/wp/v2
```

**EVMoD**
```
Base URL: https://ev.iphonemod.net/wp-json/wp/v2
```

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List posts |
| GET | `/posts/{id}` | Get single post |
| GET | `/users` | List authors |

**Query Parameters:**
- `per_page` - Number of posts (default: 10)
- `_embed` - Include embedded data (author, featured media)
- `orderby` - Sort field (date, title, etc.)
- `order` - Sort direction (asc, desc)

**Example:**
```bash
curl "https://www.iphonemod.net/wp-json/wp/v2/posts?per_page=5&_embed=author,wp:featuredmedia"
```

---

### YouTube Data API v3

**Base URL:** `https://www.googleapis.com/youtube/v3`

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/channels` | Channel statistics |
| GET | `/search` | Search videos |
| GET | `/videos` | Video details |

**Required Headers:**
```
Authorization: Bearer {API_KEY}
```

**Channel Stats:**
```bash
curl "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCC1hWOd-EtRNuqVKkOyPLXQ&key={API_KEY}"
```

**Recent Videos:**
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCC1hWOd-EtRNuqVKkOyPLXQ&order=date&type=video&maxResults=10&key={API_KEY}"
```

---

### Google Sheets API (Planned)

**News Database Sheet:**
```
Sheet ID: 1dCXcUhZljL6065RjonJEoTk9hA31gXIrFiIYwts_FCk
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| date | Date | วันที่เพิ่ม |
| time | Time | เวลาที่เพิ่ม |
| source | String | แหล่งข่าว |
| category | String | หมวดหมู่ |
| title | String | หัวข้อข่าว |
| url | URL | ลิงก์ต้นฉบับ |
| summary | String | สรุปข่าว |
| selected_by | String | ผู้เลือก |
| team | String | ทีม |
| status | String | สถานะ |
| posted_date | Date | วันที่โพสต์ |
| notes | String | หมายเหตุ |

---

## Internal API Routes

### Authentication

**GET /api/auth/session**
- Returns current user session
- No authentication required

**GET /api/auth/signin/google**
- Initiates Google OAuth flow

**GET /api/auth/callback/google**
- OAuth callback handler

**POST /api/auth/signout**
- Signs out current user

---

### Future API Routes (Planned)

**Activities**
```
GET    /api/activities          - List activities
POST   /api/activities          - Create activity
GET    /api/activities/{id}     - Get activity
PUT    /api/activities/{id}     - Update activity
DELETE /api/activities/{id}     - Delete activity
```

**Leads**
```
GET    /api/leads               - List leads
POST   /api/leads               - Create lead
GET    /api/leads/{id}          - Get lead
PUT    /api/leads/{id}          - Update lead
DELETE /api/leads/{id}          - Delete lead
```

**Projects**
```
GET    /api/projects            - List projects
POST   /api/projects            - Create project
GET    /api/projects/{id}       - Get project
PUT    /api/projects/{id}       - Update project
DELETE /api/projects/{id}       - Delete project
PUT    /api/projects/{id}/move  - Move project to different status
```

**News**
```
GET    /api/news                - List news items
POST   /api/news                - Create news item
PUT    /api/news/{id}/claim     - Claim news item
PUT    /api/news/{id}/status    - Update status
```

**Users (Admin only)**
```
GET    /api/users               - List users
POST   /api/users/invite        - Invite user
PUT    /api/users/{id}          - Update user
DELETE /api/users/{id}          - Remove user
```

---

## Error Handling

**Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

**Error Codes:**
| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| INTERNAL_ERROR | 500 | Server error |
