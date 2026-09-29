# Project Brief — Atelier OS

## 1. Product
Premium multi-tenant Telegram Mini App operating system for barbershops and beauty salons.

Atelier OS is not designed as a traditional website. Its primary runtime is inside Telegram through a bot's Main Mini App.

## 2. Users
- Owner — performance, finances, team, branches, permissions.
- Administrator — calendar, clients, services, payments, daily operations.
- Specialist / barber — own schedule, client context, service status.

## 3. Primary goal
Give salon teams a fast mobile operational workspace inside Telegram: appointments, clients, team load, finances and actions that require attention.

## 4. Main sections/screens
- Dashboard
- Appointments
- Clients
- Staff
- Services
- Finance
- Analytics
- Settings

## 5. Required functionality
- Verified Telegram identity.
- Multi-tenant organization isolation.
- Branches and role-based access.
- Appointment CRUD and operational day agenda.
- Client CRM CRUD.
- Staff and service CRUD.
- Payments and finance views.
- Analytics derived from transactional data.
- Mobile-first Telegram experience with tablet/desktop support.

## 6. Integrations
- Telegram Main Mini App
- Telegram WebApp bridge
- PostgreSQL / Supabase Database
- Supabase auth/session foundation during development
- Vercel HTTPS deployment
- Future: WhatsApp, email, payments, loyalty

## 7. Deployment
Vercel HTTPS frontend/server runtime + Supabase managed Postgres.
The HTTPS URL is registered in @BotFather as the Main Mini App URL.

## 8. Visual direction
Premium “quiet luxury mobile operations”. Strong Manrope typography, warm light canvas, graphite surfaces, champagne accent, explicit status colors, tactile cards, bottom navigation and Telegram-safe-area behavior.

## 9. Constraints
- No fake production data presented as real.
- No secrets in Git.
- Telegram initDataUnsafe is never trusted for authorization.
- Multi-tenant isolation must be enforced server/database-side.
- Mobile usability is primary.
- No desktop-sidebar-first interface.
- Components may reuse proven primitives, but the product must not look like stock shadcn.

## 10. Definition of success
A salon owner opens Atelier OS from Telegram, is securely recognized, can manage clients and appointments, operate the day's schedule and see trustworthy business KPIs. Critical flows pass persistence, authorization, Telegram-device and production-build checks.
