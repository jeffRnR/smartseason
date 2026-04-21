# Smart Season — Field Monitoring System

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

> This full-stack application enables agricultural coordinators to monitor crop progress across multiple fields through field agents. It supports field assignment, progress updates, and automated status tracking to identify at-risk crops early. It uses JWT authentication, role-based access control, real-time computed field status, and a complete audit log of every stage change.

---

## Features

- **JWT Authentication** — Login, protected routes
- **Role-Based Access Control** — Admin vs Field Agent with strictly scoped permissions
- **Field Management** — Admins create and assign fields; agents update stage and notes only
- **Live Status Computation** — `Active / At Risk / Completed` derived at read-time, never stored in the database
- **Activity Log** — Every stage change is recorded; admins see all logs, agents see their own fields only
- **Role-Scoped Dashboard** — Admins see platform-wide stats; agents see only their assigned fields
- **Search & Filter** — Filter fields by status, stage, or free-text search

---

## Architecture

```
smart-season/                            ← Monorepo root
├── backend/
│   ├── src/
│   │   ├── controllers/                
│   │   │   ├── auth.controller.ts
│   │   │   ├── field.controller.ts
│   │   │   └── fieldLog.controller.ts
│   │   ├── services/                    
│   │   │   ├── auth.service.ts
│   │   │   ├── field.service.ts        
│   │   │   └── fieldLog.service.ts
│   │   ├── repositories/               
│   │   │   ├── user.repository.ts
│   │   │   ├── field.repository.ts
│   │   │   └── fieldLog.repository.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts   
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── field.routes.ts
│   │   │   ├── fieldLog.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── utils/
│   │   │   ├── prisma.ts                
│   │   │   └── statusCalculator.ts     
│   │   └── types/index.ts
│   └── prisma/
│       ├── schema.prisma                
│       └── seed.ts                     
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/Layout.tsx         
        │   └── ui/                     
        ├── hooks/
        │   ├── useFields.ts
        │   ├── useDashboard.ts
        │   ├── useAgents.ts
        │   └── useFieldLogs.ts
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── FieldsPage.tsx
        │   ├── LogsPage.tsx
        │   └── AgentsPage.tsx
        ├── lib/
        │   ├── api.ts               
        │   └── auth-context.tsx  
        └── types/index.ts
```

### Controller → Service → Repository

Every request flows through three strict layers with no cross-layer access:

| Layer | Responsibility |
|---|---|
| **Controller** | Parse req/res, call service, return HTTP status code |
| **Service** | Business logic, RBAC ownership checks, log writes, status enrichment |
| **Repository** | All Prisma queries — ORM is never called outside this layer |

---

## Field Status Logic

The system determines field status using both stage and time since planting.

- COMPLETED → when stage is HARVESTED
- AT_RISK → when:
  - Stage is PLANTED and > 30 days
  - Stage is GROWING and > 90 days
- ACTIVE → all other cases

This approach ensures delayed crop progress is flagged early while keeping the logic simple and explainable.

---

## Key Design Decisions

### 1. Status Computation Strategy

Field status is computed dynamically at read-time and is not stored in the database.

This ensures:
- No stale data over time
- No need for background jobs or cron tasks
- Always reflects current field conditions

This trade-off prioritises correctness over query performance, which is acceptable for the current system scale.

```typescript
export function calculateFieldStatus(stage: Stage, plantingDate: Date): FieldStatus {
  const days = getDaysSincePlanting(plantingDate);

  if (stage === Stage.HARVESTED) return 'Completed';
  if (stage === Stage.PLANTED && days > 30) return 'At Risk';
  if (stage === Stage.GROWING && days > 90) return 'At Risk';

  return 'Active';
}
```

**Why?** A field stored as `Active` on day 29 would silently remain `Active` on day 31 without a background job. Computing on read means the status always reflects the current ground truth — no cron jobs, no stale data.

| Condition | Status | Reasoning |
|---|---|---|
| Stage = `HARVESTED` | Completed | Lifecycle is done |
| Stage = `PLANTED` and days > 30 | At Risk | Should have germinated by now |
| Stage = `GROWING` and days > 90 | At Risk | Growth has stalled |
| Stage = `READY` (any age) | Active | Awaiting harvest, not at risk |
| Everything else | Active | Progressing normally |

### 2. Agents Cannot Create or Delete Fields

Agents are assigned fields by an admin. Their only write permission is updating the `currentStage` and `notes` of their own assigned fields. All other field data (name, crop type, planting date, location, agent assignment) is admin-controlled.

| Action | Admin | Agent |
|---|---|---|
| Create field | ✅ | ❌ |
| Delete field | ✅ | ❌ |
| Edit all field data | ✅ | ❌ |
| Update stage + notes | ✅ | ✅ Own fields only |
| View fields | All fields | Own fields only |

### 3. Audit Log on Every Stage Change

Every time `currentStage` changes — whether by an admin or agent — a `FieldLog` record is automatically written in `field.service.ts` before returning the updated field. The log captures the previous stage, new stage, who made the change, and any notes submitted with the update.

```typescript
if (newStage !== existing.currentStage) {
  await fieldLogRepository.create({
    fieldId: existing.id,
    agentId: userId,
    prevStage: existing.currentStage,
    newStage,
    notes: dto.notes ?? null,
  });
}
```

Log access is role-scoped: admins see all logs across the platform; agents see only logs for their assigned fields.

---

## Assumptions

- Crop growth durations are simplified and not crop-specific
- Agents only manage fields assigned to them
- Field status is derived from stage and time only (no external factors like weather or soil conditions)
- The system assumes consistent internet connectivity for updates

---

## Database Schema

```prisma
enum Role  { ADMIN  AGENT }
enum Stage { PLANTED  GROWING  READY  HARVESTED }

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  name      String
  role      Role       @default(AGENT)
  fields    Field[]
  logs      FieldLog[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Field {
  id           String     @id @default(uuid())
  name         String
  cropType     String
  plantingDate DateTime
  currentStage Stage      @default(PLANTED)
  notes        String?
  location     String?
  agentId      String
  agent        User       @relation(fields: [agentId], references: [id])
  logs         FieldLog[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([agentId])
}

model FieldLog {
  id        String   @id @default(uuid())
  fieldId   String
  field     Field    @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  agentId   String
  agent     User     @relation(fields: [agentId], references: [id])
  prevStage Stage
  newStage  Stage
  notes     String?
  createdAt DateTime @default(now())

  @@index([fieldId])
  @@index([agentId])
}
```

> `status` is intentionally absent — computed at read-time in the service layer.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL — local or [Neon](https://neon.tech) (recommended)

### 1. Clone & Install

```bash
git clone https://github.com/jeffRnR/smartseason
cd smart-season
npm run install:all
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/smart_season?sslmode=require"
JWT_SECRET="any-long-random-string-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5000"
```

> **Using Neon?** Go to [neon.tech](https://neon.tech) → New Project → copy the connection string into `DATABASE_URL`.

### 3. Database Setup

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Create tables — name the migration "init"
npm run db:seed       # Insert demo users and fields
```

### 4. Start Dev Servers

```bash
# Terminal 1 — API on http://localhost:3001
npm run dev:backend

# Terminal 2 — App on http://localhost:5000
npm run dev:frontend
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartseason.com` | `password123` |
| Field Agent | `agent1@smartseason.com` | `password123` |
| Field Agent | `agent2@smartseason.com` | `password123` |

> Change all credentials before any production deployment.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Login — returns JWT + user |
| `GET` | `/api/auth/profile` | ✅ | Get current user |

### Fields

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/fields` | ✅ | List fields — role scoped |
| `POST` | `/api/fields` | ✅ Admin | Create and assign field to agent |
| `GET` | `/api/fields/:id` | ✅ | Get single field with computed status |
| `PATCH` | `/api/fields/:id` | ✅ | Admins edit all; agents update stage + notes only |
| `DELETE` | `/api/fields/:id` | ✅ Admin | Delete field |
| `GET` | `/api/fields/dashboard` | ✅ | Aggregated stats — role scoped |

### Activity Logs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/logs` | ✅ | All logs (admin) or own field logs (agent) |
| `GET` | `/api/logs/field/:fieldId` | ✅ | Logs for one field — agent must own it |

### Users *(Admin only)*

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | ✅ Admin | List all users with field counts |

---

## Frontend Pages

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login with demo credentials hint |
| `/dashboard` | All roles | KPI cards, at-risk alerts, recent fields |
| `/fields` | All roles | Search, filter, update fields; admins can add/delete |
| `/logs` | All roles | Timeline of all stage changes — role scoped |
| `/agents` | Admin only | Agent directory with field counts |

---

## Scripts

```bash
npm run install:all      #install backend and frontend dependencies
npm run dev:backend      #start express API
npm run dev:frontend     # start vite dev server
npm run db:generate      # prisma generate
npm run db:migrate       # prisma migrate dev
npm run db:seed          # seed demo data to prisma db
npm run db:studio        #open prisma studio on web browser
npm run build:backend    #compile TypeScript
npm run build:frontend   #vite production build
```

---

## Deployment

### Database → Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Paste the connection string into `DATABASE_URL`
3. Run `npx prisma migrate deploy` in production (not `migrate dev`)

### Backend → Railway / Render

```
Root Directory:  backend/
Build Command:   npm install && npm run build
Start Command:   npm start
```

Set all environment variables from `.env`.

### Frontend → Vercel

```
Root Directory:  frontend/
```

Add:

```
VITE_API_BASE_URL=https://your-backend.railway.app
```

> **Note:** The Vite `/api` proxy only works in development. In production, update `frontend/src/lib/api.ts` to use `import.meta.env.VITE_API_BASE_URL` as the Axios base URL.

---

## Live Deployment

Frontend: https://smartseasonke.vercel.app/

---

## Tech Stack

| | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## Future Improvements

- Introduce crop-specific growth thresholds for more accurate risk detection
- Add offline support for field agents in low-connectivity areas
- Integrate weather and soil data for more advanced risk analysis
- Implement notifications for at-risk fields

---