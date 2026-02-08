# FinPulse Mobile

E-commerce mobile app for product browsing, categories, cart, and profile management. Part of the fintech-project monorepo.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Expo 54, React 19, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| State | Zustand |
| Styling | Emotion (native + react) |
| HTTP | Axios |
| Storage | AsyncStorage |
| Navigation | React Navigation (bottom-tabs, native) |
| Testing | Jest, React Native Testing Library |

## Main Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `/(tabs)/` | Hero carousel, product list, featured items |
| Categories | `/(tabs)/categories` | Category browsing and filtering |
| Cart | `/(tabs)/cart` | Shopping cart with quantity controls |
| Profile | `/(tabs)/profile` | User profile and settings |
| Product Detail | `/product/[id]` | Product info, image carousel, add to cart |

## Getting Started

```bash
pnpm install
pnpm start
```

Then run on iOS simulator, Android emulator, or Expo Go.

## Environment

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` for the backend API (default: `http://localhost:3001`).
