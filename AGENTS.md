# AGENTS.md

These rules apply to every AI agent working in this repository.

## Required order of work
Before implementing a feature:
1. Read PROJECT-BRIEF.md.
2. Read ARCHITECTURE.md.
3. Read DESIGN-SYSTEM.md.
4. Read BUSINESS-RULES.md.
5. Read IMPLEMENTATION-PLAN.md.
6. Read TESTING.md.
7. Inspect the existing code before proposing structural changes.

If a document is intentionally incomplete, fill the missing part before large implementation work.

## UI / UX
- Consult UI UX Pro Max for layout, product-type patterns, typography, color, accessibility and anti-patterns.
- Prefer existing components from shadcn/ui or Astryx over handwritten primitives.
- Before using any external component, verify the API against current documentation or installed source.
- Reuse existing project components before adding a new dependency.
- Do not introduce a second visual language into an established project.
- Do not change global colors, spacing, typography, navigation or layout for a local feature request unless required.
- Avoid decorative complexity that does not serve the product goal.
- Ensure keyboard access, visible focus, sufficient contrast and responsive behavior.

## Implementation discipline
- Do not rewrite working areas to solve a local problem.
- Prefer small, reversible changes.
- Do not invent package APIs, database fields, routes, environment variables or backend behavior.
- Do not hide errors with fake success states.
- Never represent mocked data as a real integration.
- Never claim deployment, database writes, authentication, email, payments, AI calls or external API connections work unless verified.
- If a dependency version matters, inspect the installed version or official current docs.

## Testing
A successful build is not sufficient.

For changed functionality:
- run type checks;
- run linting where configured;
- run relevant unit/integration tests;
- start the app;
- verify the feature in a browser;
- check relevant browser console/network errors;
- verify responsive states where UI is changed;
- run critical end-to-end flows when applicable.

After a bug fix, verify both:
1. the original failing scenario;
2. a nearby regression scenario.

## Data and security
- Keep credentials in environment variables.
- Never commit .env secrets.
- Apply least privilege.
- For multi-user or multi-tenant systems, enforce authorization server-side.
- Database security must not rely only on hidden UI.
- Migrations must be explicit and reversible when practical.

## Completion standard
Do not say “done” until:
- requested behavior is implemented;
- acceptance criteria pass;
- no known blocking error remains;
- verification performed is stated accurately.

If something could not be verified, say exactly what remains unverified.
