# Robinhood-Aligned Design Style

> Product UI must be **entirely consistent with Robinhood's style**: minimal, bold, and finance-first.  
> 中文: [design-style.md](../../zh/product/design-style.md)

## Design philosophy

- **Less is more** — Streamlined, distraction-free experience; no visual clutter.
- **Bold and cutting-edge** — Confident typography and clear hierarchy.
- **Sophisticated** — Mature, precise visuals; avoid playful or toy-like aesthetics.
- **Customer-centric** — Every element serves clarity and quick decision-making.

## Visual identity (Robinhood reference)

- **Primary accent**: **Robin Neon** `#CCFF00` (RGB 204, 255, 0) — Robinhood’s signature yellow‑green; use for primary CTAs, key highlights, and positive emphasis where it fits the product.
- **Base palette**: Black, white, and neutrals. Prefer a **dark-first** app experience (e.g. background `#000000`).
- **Layout**: Intentional **modular layout**; consistent spacing and clear sections.

## Color system

### Semantic colors

| Role        | Light mode        | Dark mode          | Usage                    |
|------------|--------------------|---------------------|--------------------------|
| **Gains**  | `#34C759` (green)  | `#30D158`           | Positive P&amp;L, up moves |
| **Losses** | `#FF3B30` (red)    | `#FF453A`           | Negative P&amp;L, down moves |
| **Primary**| Dark neutral / Robin Neon | White / Robin Neon | Buttons, key actions     |
| **Surface**| `#F5F5F7`          | `rgba(255,255,255,0.06)` | Cards, inputs, elevated UI |
| **Card**   | `#FFFFFF`          | `rgba(255,255,255,0.08)` or `#141414` | Content blocks, chart areas |
| **Background** | `#FFFFFF`      | `#000000`           | App/screen background    |

- **Sell / destructive**: Use loss red with light tint for sell actions (e.g. `rgba(255,59,48,0.15)` for backgrounds).
- **Buy / primary action**: Use primary or Robin Neon; ensure contrast (e.g. dark text on Robin Neon).

### Text hierarchy

- **Primary text**: High contrast (e.g. `#1D1D1F` light, `rgba(255,255,255,0.9)` dark).
- **Secondary**: ~60% opacity of primary.
- **Tertiary**: ~40–50% opacity for hints and labels.

## Typography

- **Clean sans-serif** only; avoid decorative or script fonts.
- Clear **size and weight hierarchy**: titles > body > captions.
- **Numbers**: Tabular figures for prices and amounts; right-align in tables and lists.

## Components and patterns

- **Cards**: Rounded corners (e.g. 10–14px), subtle surface/card background; minimal borders or borderless.
- **Charts**: Dark chart area on dark background; green/red for gains/losses; clear crosshair and tooltip (e.g. dark tooltip `rgba(30,30,34,0.95)`).
- **Drawers / modals**: Full-width or near full-width; rounded top corners; solid card background (`cardSolid`) over dimmed backdrop.
- **Buttons**: Primary = filled (primary or Robin Neon); secondary = surface fill or outline; sufficient touch target (min 44pt).
- **Lists**: Simple rows; optional sparklines; gain/loss colored by sign.

## Layout and spacing

- **Modular grid**: Consistent vertical rhythm and horizontal padding (e.g. 16–24px).
- **White space**: Generous; avoid crowding numbers and labels.
- **Charts**: Prominent; consistent padding and safe areas for labels and legends.

## Accessibility

- **Contrast**: Meet WCAG AA for text and interactive elements.
- **Gains/losses**: Do not rely on color alone; use “+ / −”, labels, or icons so color-blind users can interpret.
- **Focus and touch**: Visible focus states and adequate hit areas.

## Implementation notes

- **Theme tokens**: Prefer central tokens (e.g. `colors.success`, `colors.error`, `colors.background`, `colors.card`, `colors.surface`) so light/dark and future Robin Neon accents stay consistent.
- **Mobile (e.g. mobile-portfolio)**: Default to **dark theme** (#000000 background, dark cards, light text) to align with Robinhood’s in-app feel.
- **Web**: Support light and dark; use the same semantic palette and Robin Neon for key actions where appropriate.

---

*References: Robinhood visual identity (2024), in-app patterns; project tokens in `apps/mobile-portfolio/src/presentation/theme/colors.ts`.*
