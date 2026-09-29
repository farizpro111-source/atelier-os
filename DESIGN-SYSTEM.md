# Design System — Atelier OS

## Contract: Quiet precision / mobile salon operations
Premium Telegram Mini App, Salon CRM, Appointment Scheduling and Business Dashboard; 390px portrait first. Existing Manrope retained for Cyrillic and strong tabular numerals. No marketing hero, decorative serif, glass, parallax, fake metrics or default shadcn skin.

## Research decision
See docs/REDESIGN-AUDIT.md. UI UX Pro Max was actually executed; its automatic marketing pattern matches were rejected. This is a project-specific synthesis, not a claim that the generator chose the final design unchanged. Astryx contributes metadata-list, card hierarchy, activity-feed and segmented-control patterns. shadcn/Radix contributes accessible Sheet and AlertDialog behavior; no second UI runtime.

## Tokens (globals.css is implementation)
Canvas #f6f5f1; surface #ffffff; elevated #ffffff; ink #202923; secondary #62685f; accent #79603a; accent-soft #eee6d8; positive #306647; warning #815517; danger #a13732; border #e4e6df; focus #79603a. Dark emphasis #202923 with #f7f6ee text. Light and dark semantic palettes; no arbitrary per-component hex.
Radius: controls 12px, cards 20px, sheets 28px. Spacing 4/8/12/16/20/24/32. Mobile gutter 20px (16px <=360px). Restrained shadow only on overlays. Typography 12 metadata, 14 secondary, 16 body/input, 20 section, 30 heading, 40 metric. Weight 500 body, 600 labels, 700 subheads, 800 headings. Line height 1.5 body, 1.12 heading. Numeric tabular; long names wrap.

## Navigation and composition
Five bottom items: Обзор / Записи / Клиенты / Финансы / Ещё. More has real links to staff, services, analytics, settings; active state includes pill and aria-current. App header shows organization context, not dummy notifications. One primary action per page. Revenue is a single high-emphasis card; appointment count and available time secondary. Operational attention above upcoming guests; analytics disclosed below.

## Interaction
48px minimum primary controls, 44px minimum links, 8px gaps. Agenda rather than horizontal schedule table. Card details/edit use focus-trapped bottom sheet, Escape close and restored trigger focus. Destructive archive/cancel asks confirmation. Persistent labels, required hints, inline errors and live success; pending buttons disabled. No hover-only actions. Date/time are in salon timezone, never silently browser timezone.

## States
Loading skeleton reserves layout and has screen-reader status. Empty lists explain first step and offer action; zero-data business is not error. Network/config errors are not converted to zeros. Permission state states reason; outside Telegram provides explicit entry instructions without fake identity. No demo data in production imports.

## Platform and accessibility
Respect sum of Telegram device + content insets, with CSS env fallback. Reserve bottom navigation space including insets. Inputs 16px, zoom permitted, scrollable sheets and visual viewport/keyboard adaptation. Lucide 20px/2px stroke only. Visible focus, >=4.5:1 normal text, meaning also conveyed in words, reduced motion, no endless animation. Test 320/390/768/1280px and long Cyrillic. Browser simulation is not iOS/Android device verification.
