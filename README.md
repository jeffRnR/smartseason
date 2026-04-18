# 🌱 Smart Season — Field Monitoring System

A full-stack agricultural field monitoring platform with role-based access control, real-time status computation, and a clean monorepo architecture.

---

## Architecture Overview

```
smart-season/
├── backend/                   # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/       # Route handlers — thin, delegate to services
│   │   ├── services/          # Core business logic (status computation)
│   │   ├── repositories/      # Prisma data access layer
│   │   ├── middleware/        # JWT auth + RBAC guards
│   │   ├── routes/            # Express router definitions
│   │   ├── utils/             # Prisma client, status calculator
│   │   └── types/             # Shared TypeScript interfaces
│   └── prisma/
│       ├── schema.prisma      # Database models
│       └── seed.ts            # Demo data seeder
└── frontend/                  # React + Vite + Tailwind CSS
    └── src/
        ├── components/        # Reusable UI (cards, badges, forms, layout)
        ├── hooks/             # API data-fetching hooks
        ├── pages/             # Dashboard, Fields, Agents, Auth
        ├── lib/               # Axios client, Auth context
        └── types/             # Frontend TypeScript types
```

---

## Key Design Decisions

### 1. Status is Computed, Never Stored

The `status` field (`Active`, `At Risk`, `Completed`) is **not persisted in the database**. It is derived on every read in the Service Layer:

```typescript
// backend/src/utils/statusCalculator.ts
export function calculateFieldStatus(stage: Stage, plantingDate: Date): FieldStatus {
  const days = getDaysSincePlanting(plantingDate);
  if (stage === Stage.HARVESTED) return 'Completed';
  if (stage === Stage.PLANTED && days > 30) return 'At Risk';
  if (stage === Stage.GROWING && days > 90) return 'At Risk';
  return 'Active';
}
```

**Why?** Storing a computed value creates data staleness. A field stored as "Active" on day 29 becomes "At Risk" on day 31 without any update. By computing on read, the status always reflects reality.

### 2. Controller → Service → Repository Pattern

- **Controllers** handle HTTP concerns only (req/res parsing, status codes)
- **Services** own business logic — status computation, authorization checks, data enrichment
- **Repositories** own all Prisma queries — no ORM calls outside this layer

### 3. Role-Based Access Control

Two roles with distinct permissions:

| Action | Admin | Agent |
|---|---|---|
| View all fields | ✅ | ❌ (own only) |
| Assign field to agent | ✅ | ❌ |
| View all agents | ✅ | ❌ |
| Dashboard stats | All fields | Own fields only |
| Create/Edit/Delete | Own or any | Own fields only |

Enforced via `authenticate` middleware (JWT verification) and `requireRole` guards in routes, with secondary ownership checks in the Service layer for field-level access.

### 4. Status Rules

| Condition | Status |
|---|---|
| Stage = `HARVESTED` | ✅ Completed |
| Stage = `PLANTED` AND days > 30 | ⚠️ At Risk |
| Stage = `GROWING` AND days > 90 | ⚠️ At Risk |
| All other cases | 🟢 Active |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js + TypeScript |
| HTTP Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL (Neon compatible) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))
- npm

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Backend Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smart_season"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Start Development Servers

In two terminals:

```bash
# Terminal 1 — Backend (port 3001)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartseason.com | password123 |
| Agent | agent1@smartseason.com | password123 |
| Agent | agent2@smartseason.com | password123 |

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get current user |

### Fields

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/fields` | ✅ | List fields (role-scoped) |
| POST | `/api/fields` | ✅ | Create field |
| GET | `/api/fields/:id` | ✅ | Get single field |
| PATCH | `/api/fields/:id` | ✅ | Update field |
| DELETE | `/api/fields/:id` | ✅ | Delete field |
| GET | `/api/fields/dashboard` | ✅ | Aggregated stats |

### Users (Admin only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | ✅ Admin | List all users |

---

## Prisma Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(AGENT)
  fields    Field[]
}

model Field {
  id           String   @id @default(uuid())
  name         String
  cropType     String
  plantingDate DateTime
  currentStage Stage    @default(PLANTED)
  notes        String?
  location     String?
  agentId      String
  agent        User     @relation(fields: [agentId], references: [id])
}
```

`status` is intentionally absent from the schema — it lives only in application logic.

---

## Frontend Pages

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login form |
| `/register` | Public | Registration |
| `/dashboard` | All roles | Stats + risk alerts |
| `/fields` | All roles | CRUD field management |
| `/agents` | Admin only | Agent directory |

---

## Deployment Notes

- **Backend**: Deploy to Railway, Render, or any Node.js host. Set all env vars.
- **Database**: Use [Neon](https://neon.tech) for serverless PostgreSQL.
- **Frontend**: Deploy to Vercel. Set `VITE_API_URL` if not using the Vite proxy.
- **Vite proxy** (`/api → localhost:3001`) only works in dev. In production, configure `VITE_API_BASE_URL` and update the Axios base URL.
