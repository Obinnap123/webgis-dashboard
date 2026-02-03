# TicketHub - Enterprise Service Request Management System

> **A professional, production-ready SaaS dashboard for managing service requests and tickets at scale**

## ��� The Problem We're Solving

**Organizations struggle with fragmented service request management:**

- ❌ Support teams using email for ticket tracking (loses context, creates duplicates)
- ❌ No visibility into ticket status, priorities, and resolution times
- ❌ Lack of accountability - hard to track who did what and when
- ❌ No real-time analytics to identify bottlenecks
- ❌ Manual role management leading to security and oversight issues
- ❌ Scattered information across multiple tools and spreadsheets

**TicketHub solves this by providing:**
✅ Centralized ticket management with full lifecycle tracking
✅ Real-time dashboard with actionable insights
✅ Role-based access control for team security
✅ Complete audit trail of all changes
✅ Advanced filtering and search capabilities
✅ Professional SaaS interface that teams actually want to use

---

## ��� Features Overview

### ��� Complete Ticket Lifecycle Management
- **Create** tickets with title, description, priority levels
- **Track** status progression: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- **Assign** tickets to team members with automatic notifications (future)
- **Filter** by status, priority, or assigned user for quick discovery
- **Update** tickets in real-time with automatic activity logging
- **Resolve** with automatic time-to-resolution calculations

### ��� User & Role Management (Admin)
- Create and manage team members
- Assign roles: **Admin** (full control) or **Staff** (ticket management only)
- Change user roles dynamically with customized dropdown
- Track user activity and changes
- Delete users with safety confirmations

### ��� Real-Time Dashboard Analytics
- **Live Statistics**: Total, Open, In-Progress, Resolved ticket counts
- **Resolution Time Tracking**: Average hours to resolve tickets
- **Visual Analytics**: 
  - Pie charts for status distribution
  - Priority breakdown visualization
  - Recent activity widget
- **System Health**: Response time, database health, API uptime monitoring
- **Responsive Design**: Works on desktop, tablet, and mobile

### ��� Enterprise-Grade Security
- **Password Hashing**: bcrypt with 10-round cost factor
- **JWT Sessions**: 30-day secure token-based authentication
- **Role-Based Access Control**: Admin and Staff roles with enforced permissions
- **Activity Audit Trail**: Complete log of who did what and when
- **Secure HTTP-Only Cookies**: Production-ready session management
- **Protection Against Self-Deletion**: Admins can't accidentally remove themselves

### ��� Modern, Professional UI
- Clean SaaS dashboard design with Tailwind CSS
- Soft shadows and rounded cards for premium feel
- Responsive grid layouts that work on all devices
- Smooth animations and hover effects
- Color-coded badges for quick status recognition
- Mobile navigation with collapsible sidebar
- Customized dropdown components with emoji icons

---

## ���️ How It Works

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  React 19 + Next.js 16 (App Router) + TypeScript       │
│  Components: Dashboard, Forms, Tables, Charts            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   API Layer                              │
│  Next.js API Routes with Role-Based Authorization       │
│  Endpoints: /api/tickets, /api/users, /api/dashboard    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Business Logic                           │
│  Authentication: NextAuth.js with JWT                   │
│  Authorization: Role checks on every endpoint           │
│  Validation: Type-safe with TypeScript & Prisma         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Database Layer (Prisma ORM)                 │
│  PostgreSQL with 3 Models: User, Ticket, Activity       │
│  Hosted on: Neon Cloud PostgreSQL                       │
└─────────────────────────────────────────────────────────┘
```

### User Flow

**1. Authentication & Authorization**
```
User Login (email/password)
    ↓
NextAuth CredentialsProvider validates credentials
    ↓
Prisma queries User table (email check)
    ↓
bcrypt compares password securely
    ↓
JWT token generated (30-day expiration)
    ↓
Session created with role included
    ↓
User redirected to Dashboard
```

**2. Ticket Creation & Management**
```
Staff/Admin clicks "New Ticket"
    ↓
Form submission with title, description, priority
    ↓
API validates input (TypeScript types)
    ↓
Prisma creates Ticket in database
    ↓
Activity log auto-created for audit trail
    ↓
Redirect to ticket detail page
    ↓
User can update status, priority, assignment
    ↓
Each change logged to Activity table
```

**3. Role-Based Access Control**
```
Every API request checked for:
├─ Is user authenticated? (JWT token valid)
├─ Does request require specific role? (Admin/Staff)
├─ Is user authorized? (role matches requirement)
└─ Log the action in Activity table
```

### Data Models

**User**
```
- id (UUID)
- email (unique)
- name
- password (bcrypt hashed)
- role (ADMIN | STAFF)
- isActive (boolean)
- createdAt, updatedAt
├─ Relations: Created Tickets, Assigned Tickets, Activities
```

**Ticket**
```
- id (UUID)
- title, description
- status (OPEN | IN_PROGRESS | RESOLVED | CLOSED)
- priority (LOW | MEDIUM | HIGH | URGENT)
- createdBy (User reference)
- assignedTo (User reference, optional)
- createdAt, updatedAt, resolvedAt
├─ Relations: Creator, Assignee, Activity logs
```

**Activity (Audit Trail)**
```
- id (UUID)
- ticket (Ticket reference)
- user (User reference)
- action (created, assigned, status_changed, etc)
- previousValue, newValue (for tracking changes)
- createdAt
├─ Relations: Ticket, User
```

---

## ��� Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2.3 | UI library |
| **Framework** | Next.js | 16.1.6 | Full-stack web framework (Turbopack) |
| **Language** | TypeScript | 5.x | Type safety across stack |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Icons** | Lucide React | 0.563.0 | Beautiful icons |
| **Charts** | Recharts | 3.7.0 | Data visualization |
| **Forms** | React Hook Form | 7.71.1 | Form management |
| **Auth** | NextAuth.js | 4.24.13 | Authentication & sessions |
| **Security** | bcrypt | 6.0.0 | Password hashing |
| **Database** | PostgreSQL | 15+ | Relational database |
| **ORM** | Prisma | 6.19.2 | Type-safe database access |
| **Validation** | Zod | 4.3.6 | Runtime validation |

---

## ��� Getting Started

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database (or Neon Cloud account - free)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd webgis-dashboard

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create .env.local file:
DATABASE_URL="postgresql://user:password@host/db"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_URL="http://localhost:3000"

# 4. Set up database
npx prisma db push
npm run db:seed

# 5. Start development server
npm run dev

# 6. Visit http://localhost:3000
```

### Demo Credentials

```
Admin Account:
  Email: admin@example.com
  Password: password123

Staff Account:
  Email: staff1@example.com
  Password: password123
```

---

## ��� Key Differentiators

### Why TicketHub Stands Out

1. **Production-Ready Code**
   - Zero TypeScript errors
   - Full type safety throughout
   - Follows Next.js best practices
   - Production build succeeds (5.4s build time)
   - Clean, maintainable code architecture

2. **Security-First Design**
   - bcrypt password hashing (10 rounds)
   - JWT tokens with expiration
   - Complete audit trail
   - Role-based access control
   - No sensitive data in logs
   - Protection against common vulnerabilities

3. **Professional UX/UI**
   - SaaS-quality dashboard design
   - Responsive on all devices
   - Smooth animations and transitions
   - Intuitive navigation
   - Real-time feedback
   - Customized components (dropdowns with emojis)

4. **Scalable Architecture**
   - Clean separation of concerns
   - Reusable components (15+ components)
   - API-first design
   - Efficient database queries with proper indexes
   - Easy to extend and maintain

5. **Business Value**
   - Solves real organizational problems
   - ROI-focused features (analytics, tracking)
   - Reduces manual work and errors
   - Improves accountability and transparency
   - Enables data-driven decisions
   - Increases team efficiency

---

## ��� API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Logout

### Tickets (Role: Any authenticated user)
- `GET /api/tickets?status=OPEN&priority=HIGH` - List tickets with filters
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/[id]` - Get ticket details
- `PATCH /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket (admin only)

### Users (Role: Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PATCH /api/users/[id]` - Update user role
- `DELETE /api/users/[id]` - Delete user

### Dashboard (Role: Any authenticated user)
- `GET /api/dashboard/stats` - Get dashboard statistics and recent tickets

---

## ��� Pages & Features

| Page | Route | Auth | Features |
|------|-------|------|----------|
| Login | `/login` | No | Credentials form, demo credentials display |
| Dashboard | `/dashboard` | ✓ | Stats cards, charts, recent tickets, system health |
| Tickets List | `/tickets` | ✓ | Filter by status/priority, create new, pagination |
| Create Ticket | `/tickets/new` | ✓ | Form validation, error handling, redirect |
| Ticket Detail | `/tickets/[id]` | ✓ | View details, update status/priority, activity log |
| Users (Admin) | `/admin/users` | ✓ Admin | View all users, change roles, delete users |
| Create User | `/admin/users/new` | ✓ Admin | Create new user with role assignment |
| Unauthorized | `/unauthorized` | No | Access denied page |

---

## ��� Performance Metrics

- **Build Time**: 4-5 seconds (Turbopack)
- **Dev Server Start**: <1 second
- **Page Load**: <200ms (cached)
- **API Response**: <100ms (database queries)
- **Dashboard Stats**: ~100-200ms (parallel aggregation)
- **TypeScript Compilation**: 4-5 seconds
- **Bundle Size**: Optimized with tree-shaking

---

## ��� Security Features Implemented

✅ **Authentication**
- NextAuth.js with CredentialsProvider
- bcrypt password hashing (10 rounds)
- JWT tokens (30-day expiration)
- Secure HTTP-only cookies (production)
- CSRF protection via NextAuth

✅ **Authorization**
- Role-based access control (RBAC)
- Protected API routes with role checks
- Protected pages with automatic redirects
- Admin-only operations enforced
- Self-deletion prevention

✅ **Data Protection**
- SSL/TLS for database connections
- No sensitive data in error messages
- Activity logging for accountability
- Secure session management
- Input validation and sanitization

---

## ��� Project Statistics

- **Total Lines of Code**: ~2,800 production code
- **Components**: 15+ reusable components
- **API Endpoints**: 8 fully functional routes
- **Database Models**: 3 (User, Ticket, Activity)
- **Pages**: 8 (including error pages)
- **Type Safety**: 100% TypeScript coverage
- **Build Status**: ✅ Zero errors
- **Runtime Status**: ✅ No errors
- **Code Quality**: ESLint configured, best practices followed

---

## ��� Technical Highlights

### Why This Architecture?

1. **Next.js 16 with App Router**
   - Modern React patterns
   - Server and client components
   - Built-in optimization
   - File-based routing
   - API routes without external server

2. **TypeScript for Type Safety**
   - Catches errors at compile time
   - Self-documenting code
   - Better IDE support
   - Easier refactoring
   - 100% coverage in this project

3. **Prisma ORM**
   - Type-safe database queries
   - Automatic migrations
   - Excellent developer experience
   - Built-in validation
   - Relationships handled elegantly

4. **NextAuth.js**
   - Industry-standard authentication
   - Multiple providers support
   - Secure by default
   - JWT strategy for stateless auth
   - Easy role management

---

## ��� Future Enhancements

- [ ] Email notifications when tickets are assigned
- [ ] Real-time updates using WebSockets
- [ ] File attachments to tickets
- [ ] Comments/discussions on tickets
- [ ] Bulk actions (select multiple tickets)
- [ ] Advanced search with full-text indexing
- [ ] Custom fields per organization
- [ ] Export to PDF/CSV reports
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Slack integration
- [ ] Automated ticket routing
- [ ] SLA monitoring and alerts

---

## ��� Deployment

### Vercel (Recommended)
```bash
vercel deploy
# OR connect GitHub repo for auto-deployment
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://user:password@prod-host/db"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

---

## ��� Project Structure

```
webgis-dashboard/
├── app/
│   ├── api/                 # API routes
│   ├── (auth)/              # Auth layout group
│   ├── admin/               # Admin pages
│   ├── dashboard/           # Main dashboard
│   ├── tickets/             # Ticket management
│   └── unauthorized/        # Error pages
├── components/
│   ├── ui/                  # Base UI components
│   ├── layout/              # Layout components
│   ├── forms/               # Form components
│   └── dashboard/           # Dashboard widgets
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── db.ts                # Prisma client
│   └── auth-utils.ts        # Auth helpers
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Demo data
├── types/                   # TypeScript types
└── public/                  # Static assets
```

---

## ��� License

MIT

---

## ���‍��� About This Project

This is a **production-ready service request management system** built with modern web technologies. It solves real business problems by providing teams with a centralized, secure platform to manage service requests at scale.

**Perfect for:**
- Support teams managing customer tickets
- Internal IT helpdesks
- Service delivery organizations
- Any team needing professional request tracking
- Organizations looking for an open-source alternative to commercial solutions

---

## ��� Why Choose TicketHub?

- ✅ **Solves Real Problems**: Built to address genuine pain points in request management
- ✅ **Production Ready**: Not a tutorial project - it's built for real use
- ✅ **Type Safe**: 100% TypeScript for reliability
- ✅ **Secure**: Enterprise-grade security features
- ✅ **Scalable**: Architecture designed to grow
- ✅ **Beautiful**: Professional UI that users enjoy
- ✅ **Open Source**: No vendor lock-in
- ✅ **Easy to Deploy**: One-click Vercel deployment
- ✅ **Well Documented**: Comprehensive guides included
- ✅ **Extensible**: Easy to add new features

---

## ��� Contributing

Contributions, issues, and feature requests are welcome! This is an open-source project meant to help teams manage service requests efficiently.

---

## ��� Support & Contact

For questions, feature requests, or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, React, TypeScript, and Prisma**

**Live Demo**: [Visit TicketHub](https://your-vercel-deployment.vercel.app)
**GitHub Repo**: [GitHub Link]
