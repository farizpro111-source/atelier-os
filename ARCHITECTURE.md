# Architecture — Atelier OS

## Frontend
Framework: Next.js 16 App Router + React 19 + TypeScript.
Primary runtime: Telegram Main Mini App in Telegram WebView.
Fallback runtime: ordinary HTTPS browser for preview/support.
Rendering model: Server Components by default; Client Components only for interaction-heavy areas and Telegram bridge.
State/data fetching: Server-side data access and Server Actions; local UI state for filters/calendar interactions.
Forms/validation: native semantics first; schema validation added with CRUD.

## Telegram Mini App
Official bridge: `https://telegram.org/js/telegram-web-app.js?63`.
Startup:
1. load bridge before application scripts;
2. read safe-area/content-safe-area;
3. set Telegram header/background/bottom bar colors;
4. call `expand()`;
5. call `ready()`;
6. send raw `initData` to the server for validation.

Never authorize using `initDataUnsafe`.
Server validation uses `TELEGRAM_BOT_TOKEN` and also checks `auth_date`.

## Backend
Runtime/framework: Next.js Node.js runtime + Supabase.
API style: Server Actions for first-party mutations; Route Handlers for Telegram validation/webhooks and external integrations.
Background jobs: later for reminders and messaging.

## Database
Database: PostgreSQL via Supabase.
Schema strategy: organization-scoped business entities.
Migrations: versioned SQL in `supabase/migrations`.
Authorization model: Row Level Security + organization membership + role checks.

Tenant graph:
`Organization → Branch → Staff → Clients → Services → Appointments → Payments`

## Authentication
Primary identity direction: verified Telegram Mini App identity.
Current state: Telegram initData validation exists, but verified Telegram identity is not yet mapped to a persistent application session / Supabase actor.
Fallback foundation: Supabase Auth email/password remains available during development.
Roles: owner, admin, specialist.

Do not call Telegram sign-in complete until:
- a real bot token is configured;
- verified Telegram user is mapped to an application actor;
- session persistence is implemented;
- tenant authorization is tested.

## File storage
Supabase Storage later for avatars, portfolio/media and organization assets.

## External integrations
Primary: Telegram Mini App / bot.
Later: WhatsApp, transactional email, payments.

## Deployment
Vercel HTTPS deployment + Supabase.
HTTPS is required before configuring the Main Mini App in BotFather.

## Observability
Logging: structured server logs.
Error monitoring: add Sentry or equivalent before production.
Analytics: product analytics after core transactional flows are stable.

## Security assumptions
- Every tenant-owned table uses `organization_id`.
- RLS is mandatory.
- Browser never receives service-role or bot-token secrets.
- Role restrictions are enforced server/database-side, not only in UI.
- Telegram `initDataUnsafe` is display-only.
- Secrets stay in environment configuration.

## Architecture decisions
1. Telegram Mini App is the primary product shell, not a desktop website.
2. Mobile-first information architecture is mandatory.
3. Multi-tenant from day one.
4. Supabase remains the transactional database/RLS layer.
5. Server Components keep data access server-side.
6. UI primitives may be reused, but the visual language is custom and Telegram-native in interaction.
