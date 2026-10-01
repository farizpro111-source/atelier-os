# Implementation Plan — Atelier OS

## Continuation status — 2026-09-30

See docs/MVP-STATUS.md and artifacts/mvp-continuation for current evidence. Original phase checklist retained below; implementation and external acceptance are separate.

## Phase 0 — Discovery
- [x] Project brief defined
- [x] Architecture chosen
- [x] Initial design system defined
- [x] Telegram Mini App chosen as primary product runtime
- [x] Official Telegram Mini App docs checked
- [x] Acceptance criteria defined

## Phase 1 — Foundation
- [x] Next.js app scaffold
- [x] environment template
- [x] routing
- [x] Supabase client foundation
- [x] initial PostgreSQL/RLS schema
- [x] GitHub CI
- [x] Telegram bridge loaded
- [x] safe-area handling
- [x] Telegram haptic helper
- [x] server-side initData validator
- [x] mobile app shell + bottom navigation
- [x] Manrope typography pass
- [x] dashboard clarity redesign
- [x] appointments mobile agenda redesign
- [x] client CRM mobile redesign
- [x] ESLint green
- [x] production build green
- [x] browser visual verification
- [ ] Telegram-device verification

## Phase 2 — Real identity + data
- [ ] deploy HTTPS preview
- [ ] create/select Telegram bot
- [ ] configure `TELEGRAM_BOT_TOKEN`
- [ ] configure Main Mini App in BotFather
- [ ] verify real `initData`
- [x] map verified Telegram user to application actor
- [x] persist application session
- [x] configure Supabase project
- [x] apply migrations
- [x] real tenant-isolation test

## Phase 3 — Core CRUD

### Appointments
- [x] mobile operational agenda UI
- [x] create appointment
- [x] edit/reschedule
- [x] status lifecycle
- [x] conflict detection
- [x] persistence

### Clients
- [x] mobile CRM list UI
- [x] create
- [x] edit
- [x] archive
- [x] visit history
- [x] search
- [x] persistence

### Dashboard
- [x] priority-based mobile dashboard
- [x] replace fixtures with live KPI queries
- [x] reconcile each KPI to transactions

## Phase 4 — Team / services / finance
- [x] staff CRUD and schedules
- [x] services CRUD
- [x] payments
- [x] finance
- [x] analytics

## Phase 5 — Telegram polish
- [ ] Telegram theme synchronization
- [ ] MainButton/SecondaryButton only where they improve a flow
- [x] BackButton integration for detail/edit flows
- [ ] splash screen assets
- [ ] iOS Telegram test
- [ ] Android Telegram test
- [ ] Desktop Telegram test
- [ ] low-performance-device motion check

## Phase 6 — End-to-end
- [ ] critical browser flows
- [ ] critical Telegram flows
- [x] production build
- [ ] Vercel preview
- [ ] deployment smoke test

## Done criteria
Generated code, mock data and successful visual rendering are not enough. A feature is done only after the corresponding persistence, permission and user-flow checks pass.
