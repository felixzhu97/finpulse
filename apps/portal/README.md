# FinPulse Portal

React (Vite) portal application with Robinhood-style UI. Part of the FinPulse monorepo.

## Stack

- **React 19** + **TypeScript**
- **Vite 6** – dev server and build
- **Emotion** (@emotion/react, @emotion/styled) – Robinhood-style styling
- **@fintech/ui** – shared UI components (Radix-based)
- **@fintech/utils** – shared utilities

## Scripts

| Command   | Description                |
|----------|----------------------------|
| `pnpm dev` | Start dev server (port 3001) |
| `pnpm build` | Production build           |
| `pnpm preview` | Preview production build  |

## Run from repo root

```bash
pnpm dev:portal
# or
pnpm --filter finpulse-portal dev
```

## Project layout

- `src/main.tsx` – entry
- `src/App.tsx` – root component
- `src/index.css` – Theme variables (Robinhood-style dark theme)
- `vite.config.ts` – Vite config, `@/` alias
- `index.html` – HTML entry
