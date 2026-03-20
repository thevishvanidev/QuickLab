# LabQR — Pathology Lab Booking Platform

A mobile-first web app where patients scan a QR code and book home blood test collection.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local

# 3. Create database + seed demo data
npm run setup

# 4. Start dev server
npm run dev
```

Open: http://localhost:3000

---

## URLs

| URL | Description |
|-----|-------------|
| `/lab/demo-lab-001` | Patient booking page (scan QR here) |
| `/lab/demo-lab-001/track` | Track booking by phone number |
| `/lab/demo-lab-001/qr` | Generate & download QR code |
| `/admin` | Admin dashboard (password: `admin123`) |
| `/technician` | Technician view (password: `tech123`) |

---

## Patient Flow

1. Scan QR → lands on `/lab/[labId]`
2. Browse & add tests to cart
3. Fill details → pick date/time → choose payment
4. Get booking ID on confirmation page
5. Track status at `/track` using phone number

## Admin Flow

1. Login at `/admin` with password `admin123`
2. View all bookings, filter by status
3. Assign technician name → status changes to **Assigned**
4. After collection → set status to **Collected**
5. Upload report link → set status to **ReportReady**

## Technician Flow

1. Login at `/technician` with password `tech123`
2. See all bookings assigned to you
3. Tap **Mark Sample Collected** after visiting patient

---

## Status Pipeline

```
Pending → Assigned → Collected → ReportReady → Completed
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run setup` | Push schema + seed demo data |
| `npm run db:push` | Apply schema to DB |
| `npm run db:seed` | Seed demo lab + tests |

---

## Passwords

| Role | Password |
|------|----------|
| Admin | `admin123` |
| Technician | `tech123` |

Change in `.env.local`:
```
ADMIN_PASSWORD=your_password
TECHNICIAN_PASSWORD=your_password
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variable: `DATABASE_URL=file:./dev.db`
4. Deploy

> Note: SQLite is file-based. For production with multiple users, migrate to PostgreSQL (just change `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`).
