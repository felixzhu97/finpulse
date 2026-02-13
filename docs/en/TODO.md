# Fintech Project TODO

High-level TODO list for the entire `fintech-project` monorepo.
This list complements, but does not replace, issue tracking in Git platforms.

Chinese version: [docs_ch/TODO.md](../docs_ch/TODO.md).

## Architecture & Documentation

- [ ] Align PlantUML under `docs/en/togaf, docs/en/c4` with the codebase (apps, services/portfolio-analytics).
- [ ] Keep `docs/en/togaf/README.md, docs/en/c4/README.md` in sync with the technology stack.
- [ ] Review domain diagrams in `docs/domain` and TOGAF in `.cursor/rules/togaf-specification.mdc` when adding subsystems or flows.

## Web App (`apps/web`)

- [ ] Keep `apps/web/README.md` in sync with Angular version and module layout.
- [ ] Add end-to-end flows for key portfolio and reporting use cases.
- [ ] Expand unit and integration test coverage for critical components.

## Mobile Apps (`apps/mobile`, `apps/mobile-portfolio`)

- [ ] Add basic error and empty states for portfolio and account screens.
- [ ] Align visual style with the shared design language used on web.
- [ ] Add simple analytics or logging hooks for key in-app events.

## Shared Packages (`packages/ui`, `packages/utils`)

- [ ] Document `@fintech/ui` usage with short examples per component.
- [ ] Ensure `@fintech/utils` exposes well-named utilities with tests; extract shared helpers to avoid duplicate logic.
- [ ] Run type-check and lint across all packages before releases.

## Server (`services/portfolio-analytics`)

- [ ] Add health/readiness endpoints (e.g. `/health`, `/ready`) for API and dependencies (PostgreSQL, Kafka).
- [ ] Keep OpenAPI and `services/portfolio-analytics/README.md` in sync with API routes and env vars.
- [ ] Define production deployment (Docker, env config, scaling) and document in README or `docs/en/togaf, docs/en/c4`.

## Database (PostgreSQL, Kafka)

- [ ] Introduce database migrations (e.g. Alembic); keep schema versioned and aligned with `docs/er-diagram`.
- [ ] Document PostgreSQL backup and restore; consider retention and point-in-time recovery.
- [ ] Document Kafka topic and consumer contract for portfolio events.
- [ ] Document Kafka topics and consumer contracts for real-time market data (e.g. `market.quotes.enriched`) and how Flink jobs and the Portfolio Analytics backend consume them.

## Monitoring & Observability

- [ ] Expose API metrics (request count, latency, error rate) in Prometheus or OpenMetrics format.
- [ ] Define alerting rules for API down, DB/Kafka unreachable, and high error rate.
- [ ] Add or document a simple dashboard for API and dependency health.

## Security

- [ ] Review and harden authentication, authorization, and session handling logic for security risks.
- [ ] Scan and update third-party dependencies to address known security vulnerabilities.

## Compliance

- [ ] Ensure logging and audit trails meet compliance requirements and avoid sensitive data exposure.
- [ ] Define and implement data retention and deletion policies aligned with applicable regulations.

## Performance & Scalability

- [ ] Profile critical user flows to identify performance bottlenecks in backend and frontend.
- [ ] Design and implement caching and query optimizations for high-traffic endpoints.

## Artificial Intelligence & ML

- [ ] Extend ML Risk/VaR, Fraud, Surveillance, and Sentiment; define model serving, versioning, and monitoring for production.
- [ ] Add or extend DL time-series/risk forecast and LLM summarisation; document TensorFlow/PyTorch and OpenAI/Ollama options.
- [ ] Keep `docs/domain` and `docs/en/togaf/README.md, docs/en/c4/README.md` AI section in sync when changing AI capabilities.

## Process & Dev Experience

- [ ] Define a lightweight release checklist referencing this TODO and architecture docs.
- [ ] On significant architectural changes: update PlantUML, `docs/en/togaf/README.md, docs/en/c4/README.md`, and this `docs/TODO.md`.
- [ ] Add short “getting started” guides for new contributors to each major app and service.
