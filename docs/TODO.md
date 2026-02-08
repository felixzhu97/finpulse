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
- [X] Connect `apps/mobile-portfolio` to real backend APIs when available (replace mock portfolio data).
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

## Artificial Intelligence & ML

- [ ] Implement or integrate ML Risk and VaR engine; connect to Risk Service and Risk Metrics Store.
- [ ] Add Document and Identity AI for KYC (e.g. document verification, identity scoring); wire to Compliance and Customer services.
- [ ] Integrate Fraud and Anomaly Detection in funding/payment flow; consume from Transactions Store.
- [ ] Add Post-Trade Surveillance (anomaly and pattern detection); feed from Trade Service and Transactions Store.
- [ ] Introduce NLP and Sentiment service for market/news data; connect to Analytics Engine and Market Data Store.
- [ ] Define model serving, versioning, and monitoring strategy for production ML models.
- [ ] Keep `docs/domain/finance-system-flows.puml`, `finance-system-architecture.puml`, and `finance-system-domains.puml` in sync when adding or changing AI capabilities; update `docs/architecture/README.md` AI section and this TODO section.

## Process & Dev Experience

- [ ] Define a lightweight release checklist referencing this TODO file and architecture docs.
- [ ] Ensure every significant architectural change updates: PlantUML diagrams, `docs/architecture/README.md`, and relevant sections in this `docs/TODO.md`.
- [ ] Add short “getting started” guides for new contributors to each major app and service.
