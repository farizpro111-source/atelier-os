# Redesign audit — 2026-09-29

Baseline: fe155c5c34317f9e8c38ab488c1bfc4f27cdf329, main. Read all required Atelier and starter documents, BUSINESS-RULES and four migrations. Starter has no Telegram document or migrations; it remains unchanged.

## Before
- Dashboard, appointments, clients: MOCK. Invented KPIs, fixed dates/names, nonfunctional actions/search. Remaining modules: NOT IMPLEMENTED.
- Typography falls to 8–11px, low-opacity text, 36–40px controls. Hardcoded colors, repeated borders/shadows. Navigation More opens settings and hides other modules.
- initData validator excludes signature in HMAC, accepts malformed hexadecimal suffix; auth freshness differs between endpoints. Bootstrap stores identity but creates no application session. Onboarding is three nontransactional writes, races and can leave partial organizations.
- RLS exists, but single-column FKs allow cross-tenant associations. No database concurrency exclusion or schedule model. No lockfile or automated behavior tests.

## UI research
Executed UI UX Pro Max search.py --design-system for `Premium Telegram Mini App Salon CRM Appointment Scheduling Business Dashboard`, then narrower `salon operations dashboard premium`. First returned flat design/blue-green and Calistoga/Inter; second returned luxury black/gold and Cormorant/Montserrat but marketing storytelling/liquid glass. Neither is a verified end-to-end CRM pattern match. Reject marketing layouts, liquid glass and decorative fonts; reconcile useful palette/hierarchy/accessibility guidance with existing brand.
Executed ux touch/safe-area/navigation and nextjs forms/suspense searches. Apply 48px controls, 8px action gaps, persistent labels, 16px inputs, reflow, focus, reduced motion and five navigation destinations.

Sources reviewed: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill ; https://ui.shadcn.com/docs/components/radix/sheet ; https://astryx.atmeta.com/components . Astryx Card, Metadata List, segmented period controls, Empty State, Bottom Sheet and Activity/Revenue hierarchy evaluated. Adopt patterns, not StyleX dependency: adding a second styling runtime is unjustified. shadcn/Radix sheet and alert-dialog behavior is restyled with Atelier tokens.

## Implementation sequence
1. Design contract and domain rules. Preserve Next App Router, Supabase schema, route identities and Telegram bridge.
2. Harden signed initData; issue purpose-bound, expiring HttpOnly signed session. Resolve stable app_users and current membership server-side on every read/mutation. Admin key stays server-only.
3. Add one additive migration: atomic onboarding, composite tenant FKs, conflict exclusion, day schedules, service assignments, validation triggers.
4. Reuse shell/headings/stat components; real domain lists and sheets, CRUD/status changes, transaction-derived metrics, explicit empty/network/access states.
5. Unit tests, SQL transaction tests with rollback, lint/type/build, mobile browser screenshots, second-pass review. Keep external-device and production verification separate.

## External environment
Existing Supabase project migration names match all four repository migrations. No local bot/server credentials. Connected Vercel team currently returns zero projects; do not invent a deployment or production URL.
