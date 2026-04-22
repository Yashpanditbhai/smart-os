# Smart Operations System (SmartOS)

A full-stack internal operations management system with task tracking, role-based access control, workflow engine, and smart workload analytics.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Auth**: JWT with bcrypt password hashing
- **Validation**: Zod
- **API Docs**: Swagger/OpenAPI

## Features

- **Authentication**: Signup/login with JWT tokens
- **Role-Based Access Control**: Admin, Manager, User roles with granular permissions
- **Task Management**: Full CRUD with status workflow engine (TODO → IN_PROGRESS → IN_REVIEW → DONE)
- **Comments**: Collaboration threads on tasks
- **Activity Logs**: Complete audit trail (who did what, when)
- **Search & Filtering**: Full-text search, filter by status/priority, pagination
- **Dashboard**: Task statistics, status/priority breakdown, recent activity
- **Smart Workload Analysis**: Team load scoring, overload detection, reassignment suggestions

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd smart-os

# Backend setup
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed    # Seeds demo data
npm run dev        # Starts on http://localhost:3001

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

### Demo Accounts

All accounts use password: `password123`

| Role    | Email                 |
|---------|-----------------------|
| Admin   | admin@smartos.com     |
| Manager | manager@smartos.com   |
| User    | alice@smartos.com     |
| User    | bob@smartos.com       |

## API Documentation

Swagger UI is available at: `http://localhost:3001/api/docs`

### API Endpoints

#### Auth
| Method | Endpoint          | Description              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | /api/auth/signup  | Register new user        | No   |
| POST   | /api/auth/login   | Login                    | No   |
| GET    | /api/auth/me      | Get current user profile | Yes  |

#### Tasks
| Method | Endpoint                  | Description                        | Auth | Roles         |
|--------|---------------------------|------------------------------------|------|---------------|
| GET    | /api/tasks                | List tasks (with filters/search)   | Yes  | All           |
| POST   | /api/tasks                | Create task                        | Yes  | All           |
| GET    | /api/tasks/:id            | Get task details                   | Yes  | All           |
| PUT    | /api/tasks/:id            | Update task                        | Yes  | All*          |
| PATCH  | /api/tasks/:id/status     | Change task status (workflow)      | Yes  | All           |
| DELETE | /api/tasks/:id            | Delete task                        | Yes  | Creator/Mgr+  |
| POST   | /api/tasks/:id/comments   | Add comment                        | Yes  | All           |
| GET    | /api/tasks/:id/comments   | Get comments                       | Yes  | All           |
| GET    | /api/tasks/:id/activity   | Get task activity log              | Yes  | All           |

*Users can only update tasks they created or are assigned to.

#### Dashboard
| Method | Endpoint                  | Description                        | Auth | Roles       |
|--------|---------------------------|------------------------------------|------|-------------|
| GET    | /api/dashboard/stats      | Dashboard statistics               | Yes  | All         |
| GET    | /api/dashboard/workload   | Team workload analysis             | Yes  | Admin/Mgr   |

#### Users
| Method | Endpoint              | Description          | Auth | Roles     |
|--------|-----------------------|----------------------|------|-----------|
| GET    | /api/users            | List all users       | Yes  | Admin/Mgr |
| PATCH  | /api/users/:id/role   | Update user role     | Yes  | Admin     |

#### Activity
| Method | Endpoint       | Description          | Auth | Roles     |
|--------|----------------|----------------------|------|-----------|
| GET    | /api/activity  | All activity logs    | Yes  | Admin/Mgr |

## Project Structure

```
smart-os/
├── backend/
│   ├── prisma/           # Schema, migrations, seed
│   ├── src/
│   │   ├── config/       # Environment config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/    # Auth, RBAC, validation, errors
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── utils/        # AppError, asyncHandler
│   │   └── validators/   # Zod schemas
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios API client
│   │   ├── components/   # Shared components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Page components
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helpers
│   └── package.json
├── ENGINEERING_DECISIONS.md
└── README.md
```

## Architecture Decisions

See [ENGINEERING_DECISIONS.md](./ENGINEERING_DECISIONS.md) for detailed documentation on:
- System architecture
- Database design
- Key decisions and trade-offs
- Scaling strategy
- The invented "Smart Workload Dashboard" feature
