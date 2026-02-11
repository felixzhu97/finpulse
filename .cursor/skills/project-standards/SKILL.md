---
name: project-standards
description: Keeps documentation and diagrams in sync with code changes. Use when editing code, adding features, refactoring, or when the user asks to update docs or diagrams.
---

# Project Standards

## When to Apply

- After changing code, APIs, or architecture
- When adding or modifying features
- When the user asks to update docs or diagrams

## Update Documentation and Diagrams Promptly

After any change that affects behavior, structure, or contracts:

- **README**: Update the root README and any README in the affected area (e.g. `apps/*/README.md`, `packages/*/README.md`, `docs/**/README.md`).
- **Code/API changes**: Update relevant API docs and any `.puml` diagrams under `docs/` that describe the same area.
- **Diagrams (English and Chinese)**: When updating diagrams, update both `docs/en/` and `docs/zh/` so they stay in sync (e.g. `docs/en/c4/`, `docs/zh/c4/`; `docs/en/domain/`, `docs/zh/domain/`; `docs/en/togaf/`, `docs/zh/togaf/`; `docs/en/er-diagram/`, `docs/zh/er-diagram/`).
- **New modules or layers**: Add or adjust C4/clean-architecture diagrams in both en and zh; keep layout in sync with code (e.g. `clean-architecture-portfolio-api.puml`).
- **Data/DB changes**: Update `docs/en/er-diagram/` and `docs/zh/er-diagram/` and any schema or data-architecture docs.

Do not leave docs or diagrams outdated; update them in the same change set when possible.

## Checklist Before Finishing a Task

- [ ] README and other docs that describe the changed area are updated
- [ ] English and Chinese diagrams that describe the changed area are updated
