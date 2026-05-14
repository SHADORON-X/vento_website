# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Velmo** is a West African marketplace platform (targeting Guinea/Francophone Africa) with two distinct frontend layers that coexist in the same repo:

1. **React SPA** (`src/`) — Landing page, search results, shop onboarding (`/join`), and a Telegram-integrated seller dashboard (`/tambo`). Built with Vite + React 19.
2. **Vanilla JS marketplace** (`public/market/`) — A standalone HTML/CSS/JS app (no bundler) for the full marketplace experience: shop pages, order tracking, receipts, PWA. It communicates directly with Supabase via raw REST calls.

The React app acts as an entry point and URL router; shop/product URLs (`/s/:slug`, `/b/:slug`, `/s/:slug/p/:productId`) are immediately redirected client-side to `/market/shop.html?s=<slug>`.

## Commands

```bash
npm run dev        # Start Vite dev server (React SPA only)
npm run build      # Generate sitemap from Supabase, then Vite build
npm run lint       # ESLint on all JS/JSX files
npm run preview    # Preview the production build
npm run sitemap    # Regenerate public/sitemap.xml from Supabase data
```

There are no tests.

## Environment Variables

Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The vanilla JS files (`public/market/app.js`, `public/market/shop.js`, `scripts/gen-sitemap.js`) hardcode fallback Supabase credentials directly in source — this is intentional since they run without a bundler.

## Architecture

### React SPA (`src/`)

**Path alias:** `@` maps to `src/` (configured in `vite.config.js`).

**Global state:** `SiteContext` (`src/context/SiteContext.jsx`) provides `theme` (dark/light, persisted to `localStorage`) and `lang` (fr/en, persisted to `localStorage`). Access via the `useSite()` hook. All UI text must come from `t` (the translation object), not hardcoded strings.

**i18n:** `src/i18n/translations.js` exports `{ fr: {...}, en: {...} }`. Both language keys must be kept in sync when adding new UI text.

**API layer:** `src/lib/api.js` is the single source of truth for all Supabase queries. It:
- Uses a 5-minute in-memory cache for `getPublicShops`
- Runs parallel queries in `searchProducts` (name match + description/category/barcode match + shop name match), then merges by product ID to deduplicate
- Sanitizes query strings to escape PostgREST special characters (`%`, `_`, `\`)
- Filters: `searchShops` and `getPublicShops` use `is_public=true`; `searchProducts` uses only `is_active=true` on products, then filters by `is_public=true` on the joined shops

**Supabase client:** `src/lib/supabase.js` (JS) is what the app imports. `src/lib/supabase.ts` exists but is a duplicate — prefer the `.js` version.

**Theming:** `src/lib/themes.ts` defines 5 CSS-variable-based shop themes (dark-premium, ocean-blue, forest-green, luxury-gold, minimal-white) used by the vanilla marketplace. The React SPA itself uses Tailwind with `darkMode: 'class'` and the `data-theme` attribute on `<html>`.

**Tailwind custom tokens:**
- `velmo-orange`: `#ff6200` (brand accent)
- `velmo-dark`: `#080b10` (page background)

**Route structure:**
| Route | Handler |
|---|---|
| `/` | Landing page |
| `/search` | SearchResults (React) |
| `/join` | JoinShopPage (React) |
| `/tambo` | TelegramDashboard (React + Recharts) |
| `/s/:slug`, `/b/:slug`, `/:slug` | Redirect to `/market/shop.html` |
| `/s/:slug/p/:productId` | Redirect to `/market/shop.html` with `&p=` |
| `/order/:orderId` | Redirect to `/market/index.html?track=` |
| `/receipt/:orderId` | Redirect to `/market/index.html?receipt=` |

### Vanilla Marketplace (`public/market/`)

Self-contained, no build step. Key files:
- `app.js` — main marketplace logic (shop listing, search, orders)
- `shop.js` — individual shop page logic
- `shop.css` / `styles.css` — standalone styles (no Tailwind)
- `sw.js` — service worker for PWA/offline caching; the cache name contains a timestamp that must be bumped when static assets change
- `analytics.js` — lightweight analytics
- `bump-version.cjs` — CJS script to update the service worker cache version

Changes to vanilla JS files require manually updating the service worker cache name in `public/market/sw.js`.

### Deployment

Hosted on Netlify. `netlify.toml` configures:
- All routes redirect to `/index.html` (SPA mode) with status 200
- Security headers (CSP, HSTS, etc.) applied globally
- `/assets/*` served with 1-year immutable cache headers

The `npm run build` script runs `gen-sitemap.js` first (fetches all public shops/products from Supabase to generate `public/sitemap.xml`), then runs Vite. Sitemap generation failures do not block the build.

### Supabase Schema (inferred)

Key tables accessed by the app:
- `shops`: `id, name, slug, category, logo, cover, is_verified, is_public, is_active, orders_count, description, phone, whatsapp, facebook_url, instagram_url, tiktok_url, website_url, opening_hours, location, updated_at`
- `products`: `id, name, description, price_sale, price_regular, photo_url, category, unit, quantity, barcode, shop_id, is_active, updated_at`
- `customer_orders`: `id` (count only)

Product photos are served from Supabase Storage bucket `velmo-media` at `<SUPABASE_URL>/storage/v1/object/public/velmo-media/`.

## Key Conventions

- The codebase is bilingual (French comments/UI, English code structure). Comments and console logs are often in French — maintain that style in files that already use it.
- ESLint ignores unused variables matching `/^[A-Z_]/` (uppercase constants are exempt).
- All pages are lazy-loaded via `React.lazy` + `Suspense` for bundle splitting. Add new pages the same way.
- Framer Motion is used for all animations; prefer `motion.*` components with explicit `variants` objects defined outside the component.
- `src/data/marketplaceData.js` contains mock/static fallback data (categories, sample products) used for UI demonstrations — it is not fetched from Supabase.
