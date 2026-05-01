# MaisonBarber — Full-Stack Barbershop MVP

A production-ready barbershop management app built with **Next.js 14 App Router**, **Supabase**, **Tailwind CSS**, and **shadcn/ui** primitives. Features a premium dark-mode UI with gold accents.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, RSC) |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v3 + CSS variables |
| UI Components | Radix UI primitives + custom shadcn-style wrappers |
| Icons | Lucide React |
| Language | TypeScript |

---

## Features

### Public
- **Landing page** — Hero, Highlights, Services grid, Barbers grid, About, CTA
- **Booking Wizard** — 4-step: Service → Barber → Date/Time → Confirmation
  - Live availability slots fetched via `/api/availability`
  - Overlap prevention enforced at both API and database trigger levels

### Owner Dashboard (`/admin`)
- Overview with today's stats and recent activity
- **Appointments** — full table with inline status management, filter by status
- **Barbers** — CRUD for staff profiles (name, role, bio, avatar)
- **Services** — CRUD for the service catalogue (name, price, duration, active toggle)

### Barber Dashboard (`/dashboard`)
- Appointments filtered to the logged-in barber
- Stats: upcoming, pending, confirmed, completed counts
- Inline status updates (confirm, complete, cancel)
- Profile self-editing (bio, avatar)

---

## Database Schema

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- **`profiles`** — linked to `auth.users`, stores `full_name`, `role` (`owner` | `barber`), `bio`, `avatar_url`
- **`services`** — `name`, `duration_minutes`, `price`, `is_active`
- **`appointments`** — `client_name`, `client_phone`, `barber_id`, `service_id`, `start_time`, `end_time`, `status`

### Key DB features
- Auto-created profile row on auth sign-up (trigger)
- Auto-computed `end_time` from service duration (trigger)
- **Overlap prevention trigger** — raises `23P01` if a barber already has an active appointment in the same window
- `get_available_slots()` RPC — used by the availability API for fast slot generation
- Row-Level Security on all tables

---

## Setup

### 1. Clone and install

```bash
cd barbershop
npm install
```

### 2. Configure Supabase

Create a project at [supabase.com](https://supabase.com), then copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run the SQL schema

In the Supabase dashboard → SQL editor, paste and run the contents of `supabase/schema.sql`. This creates tables, triggers, RLS policies, and seeds 5 sample services.

### 4. Create your owner account

In Supabase → Authentication → Users, create a new user. Then in the SQL editor:

```sql
UPDATE public.profiles SET role = 'owner' WHERE id = '<your-user-id>';
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Routes

| Path | Description | Auth required |
|---|---|---|
| `/` | Landing page | No |
| `/book` | Booking wizard | No |
| `/login` | Staff login | No |
| `/auth/callback` | OAuth/magic link callback | No |
| `/admin` | Owner overview | Owner only |
| `/admin/appointments` | All appointments | Owner only |
| `/admin/barbers` | Staff management | Owner only |
| `/admin/services` | Service catalogue | Owner only |
| `/dashboard` | Barber appointments | Barber + Owner |
| `/dashboard/profile` | Profile self-edit | Barber + Owner |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/availability` | Available slots for a barber/service/day |
| `POST` | `/api/appointments` | Create appointment (public) |
| `PATCH` | `/api/appointments/[id]` | Update status (auth) |
| `GET/POST` | `/api/services` | List / create services |
| `PATCH/DELETE` | `/api/services/[id]` | Update / delete service |
| `GET/POST` | `/api/barbers` | List / upsert profiles |
| `PATCH/DELETE` | `/api/barbers/[id]` | Update / delete profile |
| `POST` | `/api/auth/signout` | Sign out |

---

## Project Structure

```
barbershop/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── book/page.tsx             # Booking wizard page
│   ├── login/page.tsx            # Login page
│   ├── admin/                    # Owner dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Overview
│   │   ├── appointments/page.tsx
│   │   ├── barbers/page.tsx
│   │   └── services/page.tsx
│   ├── dashboard/                # Barber dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── profile/page.tsx
│   └── api/                      # Route handlers
│       ├── appointments/
│       ├── availability/
│       ├── barbers/
│       └── services/
├── components/
│   ├── ui/                       # shadcn-style primitives
│   ├── booking/                  # Booking wizard components
│   ├── admin/                    # Admin-specific components
│   └── dashboard/                # Barber dashboard components
├── lib/
│   ├── supabase/                 # Client, server, middleware helpers
│   ├── availability.ts           # Slot overlap logic (TS mirror of SQL trigger)
│   ├── types.ts                  # Shared TypeScript types
│   └── utils.ts                  # cn(), formatPrice(), formatDuration()
├── middleware.ts                 # Route protection (redirects)
└── supabase/
    └── schema.sql                # Full DB schema + RLS + seed
```

---

## Availability Logic

Slot conflict is prevented at **two independent layers**:

1. **TypeScript (`lib/availability.ts`)** — `isSlotFree()` runs before the INSERT so the client gets a friendly error message before a DB round-trip.
2. **PostgreSQL trigger** (`prevent_appointment_overlap`) — enforces the invariant at the DB level with error code `23P01`, catching any race conditions or direct API calls that bypass the TS check.
