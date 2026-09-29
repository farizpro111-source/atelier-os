# Design System — Atelier OS

## Product pattern
Premium Telegram Mini App / operations CRM for barbershops and beauty salons.

## Visual direction
“Quiet Luxury Mobile Operations”.

The interface should feel like a polished native business app inside Telegram:
- strong visual hierarchy;
- clear status colors;
- compact cards;
- obvious touch targets;
- no desktop-sidebar-first composition;
- no visual ambiguity about what requires attention.

## Colors
Primary: `#191A17`
Accent: `#A98652`
Accent soft: `#EFE5D3`
Background: `#F4F0E8`
Surface: `#FFFDFA`
Text: `#171815`
Muted: `#706D65`
Success: `#3F7159`
Success soft: `#E6F1E9`
Warning: `#9C6B31`
Warning soft: `#F5EAD9`
Danger: `#A45249`
Danger soft: `#F5E5E2`

## Typography
Primary family: Manrope.
Reason: wider/heavier letterforms and high Cyrillic readability at small mobile sizes.

Weights:
- 500 body
- 600 secondary information
- 700 labels
- 800 headings, metrics and actions

Headings use tight negative tracking, but body copy remains neutral.
Numeric/data uses tabular numerals.

## Spacing
4px base grid.
Mobile page gutters: 16px.
Large mobile/tablet: 20–28px.
Vertical sections: normally 16–20px apart.

## Radius
- compact controls: 13–14px
- list items: 18–20px
- large panels: 20–22px
- status pills: fully rounded

## Depth
Use visible but restrained depth:
- stronger border contrast than the first iteration;
- broad low-opacity shadows;
- dark primary cards for emphasis;
- warm inset/outline highlights.

Avoid glassmorphism as the main language.

## Navigation
Primary navigation is a fixed Telegram-style bottom bar:
- Overview
- Appointments
- Clients
- Finance
- More

Top bar is compact, app-like and respects Telegram safe area.
Desktop/sidebar navigation is no longer the primary pattern.

## Dashboard information priority
1. Revenue today
2. Appointment count / free slots
3. Items requiring attention
4. Next appointments
5. Trend / staff load
6. Secondary modules

## Appointments
Mobile default is an agenda feed rather than a wide scheduler grid.
Each appointment must make these immediately visible:
- start/end time
- client
- service
- specialist
- amount
- status

A dense grid may be added later as an optional tablet/desktop mode.

## Clients
Mobile cards replace compressed tables.
Show:
- identity
- phone
- visit count
- last visit
- LTV
- VIP status where applicable

## Telegram requirements
- respect safe area and content safe area;
- 44px+ touch targets where practical;
- monitor Telegram theme if/when dynamic theming is enabled;
- use Telegram haptic feedback for meaningful taps;
- reduced motion support;
- no hover-only interactions.

## Anti-patterns
- desktop SaaS sidebar as primary navigation
- tiny grey text everywhere
- very thin font weights
- ambiguous card hierarchy
- horizontal data tables on phones
- hidden status/actions
- excessive decorative gradients
- stock shadcn appearance
- fake live data

## References
See `docs/REFERENCES.md` and `docs/TELEGRAM-MINI-APP.md`.
