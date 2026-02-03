# Service Request Ticket Management Dashboard

A professional, full-stack Service Request/Ticket Management system built with **Next.js 16**, **TypeScript**, **PostgreSQL**, and **Prisma**.

## Features

✅ **Authentication & Authorization**

- Secure credential-based authentication with NextAuth.js
- Role-based access control (ADMIN & STAFF)
- JWT-based session management (30-day expiration)
- Password hashing with bcrypt

✅ **Ticket Management**

- Create, read, update, and delete tickets
- Filter by status, priority, or assigned user
- Track ticket lifecycle: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Automatic resolution time calculation

✅ **Activity Logging**

- Complete audit trail of ticket changes
- Track who made changes and when

✅ **Dashboard Analytics**

- Real-time statistics and metrics
- Charts showing ticket distribution by status and priority
- Average resolution time tracking
- Recent ticket activity widget

✅ **Admin Features**

- User management (create, view, delete)
- Role assignment (ADMIN/STAFF)
- User activation/deactivation

✅ **Responsive Design**

- Mobile-friendly UI with Tailwind CSS
- Sidebar navigation with role-based menu
- Professional component library

## Tech Stack

- **Frontend**: React 19, Next.js 16 (App Router), TypeScript 5
- **Styling**: Tailwind CSS 4, Lucide React icons
- **Charts**: Recharts 3.7.0
- **Forms**: React Hook Form, Zod validation
- **Database**: PostgreSQL (Neon cloud)
- **ORM**: Prisma 6.19.2
- **Authentication**: NextAuth.js 4.24.13
- **Security**: bcrypt 6.0.0

## Project Structure

```
webgis-dashboard/
├── app/
│   ├── api/                 # API routes for CRUD operations
│   │   ├── auth/
│   │   ├── tickets/
│   │   ├── users/
│   │   └── dashboard/
│   ├── (auth)/              # Auth layout group
│   │   └── login/
│   ├── admin/               # Admin pages
│   │   └── users/
│   ├── dashboard/           # Main dashboard
│   └── tickets/             # Ticket management
├── components/              # Reusable React components
│   ├── ui/                  # UI primitives
│   ├── layout/              # Layout components
│   ├── forms/               # Form components
│   └── dashboard/           # Dashboard widgets
├── lib/                     # Utility functions
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Prisma client
│   └── auth-utils.ts        # Auth helpers
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding script
├── types/                   # TypeScript definitions
└── public/                  # Static assets
```

## Setup Instructions

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (or Neon cloud database)
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository>
cd webgis-dashboard
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-hex-32"
NEXTAUTH_URL="http://localhost:3000"
```

To generate `NEXTAUTH_SECRET`:

```bash
openssl rand -hex 32
```

### 3. Database Setup

Initialize the database:

```bash
# Push schema to database
npx prisma db push

# Seed with demo data
npm run db:seed
```

### 4. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Production Build

```bash
npm run build
npm start
```

## Demo Credentials

The seeding script creates demo users automatically:

**Admin Account:**

- Email: `admin@example.com`
- Password: `password123`

**Staff Accounts:**

- Email: `staff1@example.com`
- Password: `password123`
- Email: `staff2@example.com`
- Password: `password123`

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Logout

### Tickets

- `GET /api/tickets` - List tickets (with filters: status, priority, assignedTo)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/[id]` - Get ticket details
- `PATCH /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket (admin only)

### Users (Admin Only)

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `DELETE /api/users/[id]` - Delete user

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### User

- id, email, name, password (hashed), role (ADMIN/STAFF), isActive, createdAt, updatedAt

### Ticket

- id, title, description, status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), priority (LOW/MEDIUM/HIGH/URGENT), createdBy, assignedTo, createdAt, updatedAt

### Activity

- id, ticketId, userId, action, description, createdAt

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:push     # Push schema to database
npm run db:seed     # Seed database with demo data
npm run db:reset    # Reset database (caution!)
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based sessions
- ✅ Role-based access control (RBAC)
- ✅ Secure HTTP-only cookies (in production)
- ✅ CSRF protection with NextAuth.js
- ✅ API route authentication checks
- ✅ Type-safe database queries with Prisma

## Performance Optimizations

- Turbopack for fast builds
- TypeScript for type safety
- Server-side rendering for dynamic routes
- Static generation for public pages
- Optimized images with Next.js Image component
- Efficient database queries with Prisma

## Troubleshooting

**Issue: Database connection error**

- Verify DATABASE_URL is correct in .env.local
- Ensure PostgreSQL instance is running
- Check network connectivity to database

**Issue: Authentication not working**

- Clear browser cookies and cache
- Regenerate NEXTAUTH_SECRET with `openssl rand -hex 32`
- Ensure NEXTAUTH_URL matches your domain

**Issue: Prisma client not generating**

```bash
rm -rf node_modules .next
npm install
npx prisma generate
```

## License

MIT

## Support

For issues or questions, please contact the development team.
