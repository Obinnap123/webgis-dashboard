# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Clone & Install

```bash
git clone <your-repo>
cd webgis-dashboard
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="openssl rand -hex 32"
NEXTAUTH_URL="http://localhost:3000"
```

Get `NEXTAUTH_SECRET`:

```bash
openssl rand -hex 32
```

### Step 3: Setup Database

```bash
npx prisma db push
npm run db:seed
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

### Step 5: Login with Demo Credentials

- Email: `admin@example.com`
- Password: `password123`

---

## 📋 What You Can Do

### 🎫 Manage Tickets

- View all tickets with filters
- Create new tickets
- Update ticket status and details
- Assign tickets to staff members
- Track resolution time

### 👥 Manage Users (Admin Only)

- View all users
- Create new users with roles
- Delete users
- Manage user status

### 📊 View Dashboard

- Real-time ticket statistics
- Priority distribution chart
- Status distribution chart
- Recent activity feed
- Average resolution time

---

## 🛠 Available Commands

| Command            | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start dev server (http://localhost:3000) |
| `npm run build`    | Build for production                     |
| `npm start`        | Start production server                  |
| `npm run lint`     | Check code style                         |
| `npm run db:push`  | Sync database schema                     |
| `npm run db:seed`  | Populate demo data                       |
| `npm run db:reset` | Reset database (⚠️ deletes data)         |

---

## 🔐 Login Options

### Demo Users

```
Admin Account:
- Email: admin@example.com
- Password: password123

Staff Accounts:
- Email: staff1@example.com
- Password: password123
- Email: staff2@example.com
- Password: password123
```

### Create New Users

1. Go to Users page (admin only)
2. Click "Add User"
3. Enter email, name, select role
4. System generates temp password

---

## 📱 Navigation

### Main Menu

- **Dashboard** - View statistics
- **Tickets** - Manage tickets
  - List view with filters
  - Create new ticket
  - View/edit ticket details
- **Users** (Admin only) - Manage team members

### Ticket Statuses

- 🔵 **OPEN** - New ticket
- 🟡 **IN_PROGRESS** - Being worked on
- 🟢 **RESOLVED** - Fixed by staff
- ⚫ **CLOSED** - Verified by creator

### Priority Levels

- 🟦 **LOW** - Can wait
- 🟨 **MEDIUM** - Normal urgency
- 🟧 **HIGH** - Urgent
- 🟥 **URGENT** - Critical

---

## 🔧 Troubleshooting

### Database Connection Error

```bash
# Verify DATABASE_URL is correct
# Check PostgreSQL is running
# Test connection with:
npx prisma db execute --stdin < test.sql
```

### Port 3000 Already in Use

```bash
# Kill process on port 3000
# Or use different port:
PORT=3001 npm run dev
```

### Clear Cache & Rebuild

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Reset Everything

```bash
npm run db:reset  # ⚠️ Deletes all data
npm install
npm run dev
```

---

## 📚 File Structure

```
webgis-dashboard/
├── app/                    # Pages and API routes
│   ├── api/               # Backend endpoints
│   ├── dashboard/         # Dashboard page
│   ├── tickets/           # Ticket management
│   ├── admin/             # Admin pages
│   └── (auth)/            # Login page
├── components/            # React components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── lib/                   # Utilities
│   ├── auth.ts           # Authentication config
│   ├── db.ts             # Database client
│   └── auth-utils.ts     # Auth helpers
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Demo data
└── .env.local            # Configuration (not in git)
```

---

## 🚀 Deploy to Production

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
# Follow prompts to deploy
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables (Production)

Same as development, but with production URLs:

```env
DATABASE_URL="postgresql://user:password@prod-host/db"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

---

## 📖 Key Features

✅ **Authentication**

- Secure login with bcrypt
- JWT sessions
- Role-based access

✅ **Tickets**

- Full CRUD operations
- Advanced filtering
- Status tracking
- Priority levels
- Assignment tracking

✅ **Analytics**

- Real-time statistics
- Charts and graphs
- Activity logs
- Resolution metrics

✅ **Admin Tools**

- User management
- Role assignment
- Activity auditing
- System overview

---

## 🔗 Useful Links

- **GitHub**: [Your Repository]
- **Live Demo**: [Your Live URL]
- **Documentation**: [See IMPLEMENTATION_SUMMARY.md]
- **Tech Stack**: [See TECH_STACK.md]

---

## ❓ Need Help?

1. Check [README_SETUP.md](README_SETUP.md) for detailed setup
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for features
3. Check [TECH_STACK.md](TECH_STACK.md) for technical details
4. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues

---

## ✨ Tips & Best Practices

### ✅ Do's

- Use demo accounts for testing
- Keep .env.local out of git
- Use ADMIN account for user management
- Test with multiple roles (admin/staff)
- Backup database before bulk operations

### ❌ Don'ts

- Don't commit .env.local to git
- Don't share NEXTAUTH_SECRET publicly
- Don't store sensitive data in localStorage
- Don't delete admin accounts
- Don't modify schema.prisma without migration

---

**Ready to go!** 🎉

Start with `npm run dev` and visit http://localhost:3000
