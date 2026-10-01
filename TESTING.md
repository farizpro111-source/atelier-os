# Testing Standard — Atelier OS

## Truth labels
- REAL + VERIFIED
- REAL + UNVERIFIED
- MOCK
- NOT IMPLEMENTED

## Historical bootstrap status (superseded by docs/MVP-STATUS.md)
- CI lint/build: REAL + VERIFIED on GitHub Actions.
- Telegram bridge: REAL + UNVERIFIED until tested inside Telegram.
- Telegram initData validator: REAL + UNVERIFIED until tested with a real bot token/session.
- Mobile app shell: REAL + BUILD VERIFIED; visual/device verification still pending.
- Supabase integration: REAL + UNVERIFIED until project credentials are connected.
- Dashboard metrics: transactional payment/appointment/shift calculations; no production fixtures.
- Appointment/client persistence: implemented; real SQL CRUD/authorization tests and separate browser UI-contract tests. Authenticated Telegram end-to-end acceptance requires configured credentials.

## Build acceptance
- [x] TypeScript production build succeeds.
- [x] ESLint succeeds.
- [x] Next.js compiles application routes.
- [ ] browser rendering verified.
- [ ] Telegram rendering verified.

## Telegram acceptance
- app launches from Main Mini App button;
- `window.Telegram.WebApp` is available;
- `ready()` and `expand()` execute;
- top/bottom safe areas do not overlap Telegram controls;
- profile name/avatar can be read for display;
- raw initData validates server-side;
- tampered initData is rejected;
- initDataUnsafe is never used for authorization;
- bottom nav is usable with one hand;
- haptics do not fire when unsupported.

## Viewports
Primary:
- Telegram iPhone portrait
- Telegram Android portrait
Secondary:
- Telegram Desktop
- ordinary browser 390px
- tablet 768px

## Visual acceptance
- primary action is obvious;
- important numbers have enough weight/contrast;
- status colors include text labels;
- no horizontal business tables on phone;
- no clipped labels;
- no tiny critical controls;
- reduced motion remains usable.

## Data acceptance
- tenant A cannot read/write tenant B;
- owner/admin permission matrix works;
- specialist permissions are constrained;
- invalid appointment times fail;
- negative monetary values fail.

## Before calling Telegram auth complete
- real bot exists;
- bot token configured server-side;
- real Telegram initData passes;
- fake initData fails;
- application session is created;
- application actor is mapped to organization membership.
