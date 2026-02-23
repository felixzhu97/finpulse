# Fintech Project TODO

High-level TODO list for the entire `fintech-project` monorepo.
This list complements, but does not replace, issue tracking in Git platforms.

Chinese version: [docs/zh/TODO.md](../zh/TODO.md).

## Architecture & Documentation

- [ ] Align PlantUML under `docs/en/rd/togaf, docs/en/rd/c4` with the codebase (apps, apps/server-python).
- [ ] Keep `docs/en/rd/togaf/README.md, docs/en/rd/c4/README.md` in sync with the technology stack.
- [ ] Review domain diagrams in `docs/en/product/domain` and TOGAF in `.cursor/rules/togaf-specification.mdc` when adding subsystems or flows.

## Web App (`apps/admin`)

- [ ] Keep `apps/admin/README.md` in sync with Angular version and module layout.
- [ ] Add end-to-end flows for key portfolio and reporting use cases.
- [ ] Expand unit and integration test coverage for critical components.

## Mobile Apps (`apps/mobile`)

- [ ] Add basic error and empty states for portfolio and account screens.
- [ ] Align visual style with the shared design language used on web.
- [ ] Add simple analytics or logging hooks for key in-app events.

## Shared Packages (`packages/ui`, `packages/utils`)

- [ ] Document `@fintech/ui` usage with short examples per component.
- [ ] Ensure `@fintech/utils` exposes well-named utilities with tests; extract shared helpers to avoid duplicate logic.
- [ ] Run type-check and lint across all packages before releases.

## Server (`apps/server-python`)

- [ ] Add health/readiness endpoints (e.g. `/health`, `/ready`) for API and dependencies (PostgreSQL, Kafka).
- [ ] Keep OpenAPI and `apps/server-python/README.md` in sync with API routes and env vars.
- [ ] Define production deployment (Docker, env config, scaling) and document in README or `docs/en/rd/togaf, docs/en/rd/c4`.

## Database (PostgreSQL, Kafka)

- [ ] Introduce database migrations (e.g. Alembic); keep schema versioned and aligned with `docs/en/data/er-diagram`.
- [ ] Document PostgreSQL backup and restore; consider retention and point-in-time recovery.
- [ ] Document Kafka topic and consumer contract for portfolio events.
- [ ] Document Kafka topics and consumer contracts for real-time market data (e.g. `market.quotes.enriched`) and how Flink jobs and the Portfolio Analytics backend consume them.

## Monitoring & Observability

- [ ] Expose API metrics (request count, latency, error rate) in Prometheus or OpenMetrics format.
- [ ] Define alerting rules for API down, DB/Kafka unreachable, and high error rate.
- [ ] Add or document a simple dashboard for API and dependency health.

## Risk Management

- [ ] Clarify risk domains (market, credit, liquidity, operational) and keep `docs/en/product/domain` and `docs/en/rd/togaf` aligned with portfolio and analytics flows.
- [ ] Define core risk measures (e.g. VaR, stress tests, scenario analysis) and document inputs/outputs and assumptions in `apps/server-python` API docs.
- [ ] Ensure risk calculations are reproducible and backtestable; document data lineage and sources used for risk metrics.

## Compliance

- [ ] Identify key compliance use cases (e.g. trade surveillance, KYC/AML, sanctions screening) and reflect them in domain diagrams and service boundaries.
- [ ] Document regulatory-driven requirements for logging, retention, and audit (e.g. MiFID II, Dodd-Frank, GDPR) and ensure they are covered by monitoring and data architecture docs.
- [ ] Align data classification, access control, and retention policies with compliance requirements and capture them in `docs/en/rd/togaf` and security-related docs.

## Security

- [ ] Define security architecture (authentication, authorization, secrets management, network boundaries) and keep it documented in `docs/en/rd/togaf` and relevant C4 diagrams.
- [ ] Document secure coding and data protection practices for web, mobile, and backend (e.g. input validation, encryption in transit/at rest, key rotation, secrets storage).
- [ ] Ensure logging and monitoring capture security-relevant events (auth failures, privilege changes, suspicious activity) and align with incident response processes.

## Performance & Scalability

- [ ] Define non-functional performance targets (P95/P99 latency, throughput) for critical web and API flows and record them in architecture docs.
- [ ] Add basic performance tests or benchmarks for high-traffic endpoints in `apps/server-python` and key UI interactions in `apps/admin`.
- [ ] Document scaling strategies (horizontal/vertical, caching, queueing) and capacity planning assumptions in `docs/en/rd/togaf` and service READMEs.

## Artificial Intelligence & ML

- [ ] Extend ML Risk/VaR, Fraud, Surveillance, and Sentiment; define model serving, versioning, and monitoring for production.
- [ ] Add or extend DL time-series/risk forecast and LLM summarisation; document TensorFlow/PyTorch and OpenAI/Ollama options.
- [ ] Keep `docs/en/product/domain` and `docs/en/rd/togaf/README.md, docs/en/rd/c4/README.md` AI section in sync when changing AI capabilities.

## Process & Dev Experience

- [ ] Define a lightweight release checklist referencing this TODO and architecture docs.
- [ ] On significant architectural changes: update PlantUML, `docs/en/rd/togaf/README.md, docs/en/rd/c4/README.md`, and this `docs/TODO.md`.
- [ ] Add short “getting started” guides for new contributors to each major app and service.
