# Fintech Project TODO

High-level TODO list for the entire `fintech-project` monorepo.
This list complements, but does not replace, issue tracking in Git platforms.

## Architecture & Documentation

- [ ] Align all PlantUML diagrams under `docs/architecture` with the current codebase structure.
- [ ] Reflect mobile applications (`apps/mobile`, `apps/mobile-portfolio`) in architecture views where relevant.
- [ ] Keep `docs/architecture/README.md` in sync with the actual technology stack (Angular web app, React Native mobile apps).
- [ ] Review and update domain diagrams under `docs/domain` to cover new finance flows when added.
- [ ] Maintain TOGAF mapping in `.cursor/rules/togaf-specification.mdc` whenever new subsystems are introduced.

## Web App (`apps/web`)

- [ ] Document the Angular application structure and main modules in a dedicated `apps/web/README.md`.
- [ ] Add end-to-end flows for key portfolio and reporting use cases.
- [ ] Improve accessibility and responsiveness of core dashboard screens.
- [ ] Add more realistic sample data and scenarios for demos.
- [ ] Expand unit and integration test coverage for critical components.

## Mobile Apps (`apps/mobile`, `apps/mobile-portfolio`)

- [X] Add a `README.md` for each mobile app explaining purpose, tech stack, and main screens.
- [ ] Connect `apps/mobile-portfolio` to real backend APIs when available (replace mock portfolio data).
- [ ] Add basic error and empty states for all portfolio and account screens.
- [ ] Align visual style of mobile apps with the shared design language used on web.
- [ ] Introduce simple analytics or logging hooks for key in-app events.
- [X] Implement a custom chart render using Metal/Vulkan.

## Shared Packages (`packages/ui`, `packages/utils`, others)

- [ ] Keep `@fintech/ui` component usage documented with small examples per component.
- [ ] Ensure `@fintech/utils` exposes only well-named, generic utilities with tests.
- [ ] Avoid duplicate logic across apps and packages by extracting shared helpers where needed.
- [ ] Regularly run type-check and lint tasks across all packages before releases.
- [ ] Review dependency versions and remove unused packages from shared libraries.

## Process & Dev Experience

- [ ] Define a lightweight release checklist referencing this TODO file and architecture docs.
- [ ] Ensure every significant architectural change updates: PlantUML diagrams, `docs/architecture/README.md`, and relevant sections in this `docs/TODO.md`.
- [ ] Add short “getting started” guides for new contributors to each major app and service.
