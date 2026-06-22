# StoreRate — Store Rating Platform

A full-stack web application that lets users discover stores and submit ratings (1–5), with three distinct roles: **System Administrator**, **Normal User**, and **Store Owner**. Built as a FullStack Intern coding challenge submission.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| ORM | Prisma (latest, `prisma-client-js`) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | React 18 (Vite) |
| Routing | React Router v6 |
| Forms & Validation | React Hook Form + Zod |
| HTTP Client | Axios |
| Styling | Hand-written CSS (no framework) |

## Project Structure

```
store-rating-app/
├── server/                  # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma    # DB schema (User, Store, Rating)
│   │   
│   ├── src/
│   │   ├── config/          # Prisma client singleton
│   │   ├── controllers/     # auth, admin, store, owner
│   │   ├── middleware/      # JWT auth, role guard, validation
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # JWT + response helpers
│   │   ├── validators/      # express-validator rules
│   │   └── index.js         # App entry point
│   └── .env                 # DB url, JWT secret (not committed)
│   └── seed.js              # Seed script (creates demo accounts)
├── client/                  # React (Vite) frontend
│   └── src/
│       ├── api/             # Axios instance + API service calls
│       ├── components/
│       │   ├── ui/          # Input, Button, Modal, StarRating, SortableTable, Badge
│       │   └── layout/      # DashboardLayout (sidebar), ProtectedRoute
│       ├── context/         # AuthContext (global auth state)
│       ├── pages/
│       │   ├── admin/       # Dashboard, Users, Stores
│       │   ├── owner/       # Dashboard
│       │   ├── user/        # Stores (browse + rate)
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Settings.jsx # Shared password-update page
│       ├── utils/           # Zod validation schemas
│       └── App.jsx          # Routes
│
└── package.json             # Root convenience scripts
```

## Database Schema

- **User** — `id, name, email (unique), password (hashed), address, role (ADMIN | USER | STORE_OWNER), createdAt`
- **Store** — `id, name, email (unique), address, ownerId (FK → User, unique 1:1)`
- **Rating** — `id, value (1–5), userId (FK), storeId (FK)`, unique constraint on `(userId, storeId)` so a user can only rate a store once (re-submitting updates it).

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a hosted instance)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd store-rating-app
npm run install:all
```

### 2. Configure environment variables

**`server/.env`**
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/store_rating_db"
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Set up the database

```bash
cd server
npx prisma migrate dev --name init
npm run db:seed
```

This creates three demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@storerating.com | Admin@1234 |
| Store Owner | owner@techstore.com | Owner@1234 |
| Normal User | user@example.com | User@1234 |

### 4. Run the app

From the project root:
```bash
npm run dev
```
This starts the backend on `http://localhost:5000` and the frontend on `http://localhost:5173` concurrently.

Or run them separately:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## Form Validation Rules (enforced both client & server side)

| Field | Rule |
|---|---|
| Name | 20–60 characters |
| Address | Max 400 characters |
| Password | 8–16 characters, ≥1 uppercase, ≥1 special character |
| Email | Standard email format |
| Rating | Integer, 1–5 |

## API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| PATCH | `/api/auth/update-password` | Authenticated |
| GET | `/api/admin/dashboard` | Admin |
| GET / POST | `/api/admin/users` | Admin |
| GET | `/api/admin/users/:id` | Admin |
| GET / POST | `/api/admin/stores` | Admin |
| GET | `/api/stores` | Authenticated (User) |
| POST | `/api/stores/:storeId/ratings` | User |
| GET | `/api/owner/dashboard` | Store Owner |

All listing endpoints (`/admin/users`, `/admin/stores`, `/stores`) support query params for filtering (`name`, `email`, `address`, `role`) and sorting (`sortBy`, `order`).

## Key Design Decisions

- **Single login, role-based routing**: one `/login` endpoint issues a JWT; the frontend redirects to the correct dashboard based on `user.role`, and `ProtectedRoute` guards each section.
- **Prisma `@@unique([userId, storeId])`** on `Rating` enforces "one rating per user per store" at the database level — submitting again updates instead of duplicating.
- **Store ↔ Owner is a 1:1 relation** (`ownerId @unique` on `Store`), matching the requirement that a Store Owner manages a single store.
- **Passwords are bcrypt-hashed** with a cost factor of 12 before storage; raw passwords are never logged or returned by the API.
- **All filtering/sorting happens server-side** via Prisma `where`/`orderBy`, keeping the client thin and the queries efficient.

## License

Built for the Roxiler Systems FullStack Intern Coding Challenge.
