
# Food Explorer — Project Overview

This repository contains the Food Explorer web app — a small React + TypeScript application that uses the OpenFoodFacts public API to let users search for food products, filter by category, and view detailed nutrition and ingredient information by barcode.

---

## Quick Summary (human friendly)

- **What it does:** Search products, filter by category, sort results, view product details (nutrients, ingredients, labels), and look up products by barcode using OpenFoodFacts.
- **Built with:** Vite, React, TypeScript, Tailwind CSS, shadcn-ui, and React Query.
- **Where to look first:** `src/pages/Home.tsx` (search + results) and `src/pages/ProductDetail.tsx` (detailed view).

---

**How to run locally (Windows PowerShell)**

1. Install dependencies:

```powershell
npm install
# Food Explorer — Project Overview

This repository contains the Food Explorer web app — a small React + TypeScript application that uses the OpenFoodFacts public API to let users search for food products, filter by category, and view detailed nutrition and ingredient information by barcode.

---

## Quick Summary (human friendly)

- **What it does:** Search products, filter by category, sort results, view product details (nutrients, ingredients, labels), and look up products by barcode using OpenFoodFacts.
- **Built with:** Vite, React, TypeScript, Tailwind CSS, shadcn-ui, and React Query.
- **Where to look first:** `src/pages/Home.tsx` (search + results) and `src/pages/ProductDetail.tsx` (detailed view).

---

**How to run locally (Windows PowerShell)**

1. Install dependencies:

```powershell
npm install
```

2. Start the development server:

```powershell
npm run dev
```

3. Open the URL Vite prints to the console (default dev port is configured in `vite.config.ts`).

---

**Useful npm scripts** (see `package.json`):

- `npm run dev` — Start dev server
- `npm run build` — Build production bundle
- `npm run build:dev` — Build with `development` mode
- `npm run preview` — Preview a built bundle
- `npm run lint` — Run ESLint

---

## Project Analysis — Simple & Readable

This section explains the project's structure, how the app flows, and where to change things. It is written for quick developer onboarding.

**Purpose**
- Provide a friendly UI for exploring food product data using OpenFoodFacts: search, filter, sort, and inspect nutrition/ingredients.

**Architecture & Key Files**
- `src/main.tsx` — App entry, mounts React to the DOM.
- `src/App.tsx` — Root component; configures `react-query`, UI providers, and routing.
- `src/api/openFoodApi.ts` — API helpers and TypeScript `Product` types. Talks to `https://world.openfoodfacts.org`.
- `src/pages/Home.tsx` — Homepage: search box, barcode entry, category filter, product grid, and "Load More" pagination.
- `src/pages/ProductDetail.tsx` — Product details: image, ingredients, badges, nutrition facts per 100g, ecoscore, NOVA group, warnings.
- `src/components/` — Reusable UI parts: `SearchBar`, `BarcodeSearch`, `CategoryFilter`, `SortMenu`, `ProductCard`, and a `ui/` subfolder with shadcn-like primitives.
- `vite.config.ts` — Development server settings and build config.
- `package.json` — Dependencies and scripts.

**Data flow (simple)**
1. Home page triggers API calls through helpers in `src/api/openFoodApi.ts`.
2. Results are cached and managed with `@tanstack/react-query`.
3. Clicking a product navigates to `/product/:barcode`, which requests the product JSON and renders details.

**Main dependencies (high-level)**
- `react`, `react-dom` — UI
- `vite` — dev server / build tool
- `typescript` — types
- `tailwindcss` — styling
- `@tanstack/react-query` — data fetching/caching
- `react-router-dom` — routing
- `sonner` — toasts
- `lucide-react` — icons

---

## Notes & Troubleshooting

- The app uses the public OpenFoodFacts API; the API can sometimes be slow or incomplete for some barcodes or fields.
- If you see CORS or network errors, check your network and the API availability. The app already shows user-friendly toasts when requests fail.
- Images may be missing for some products; the UI provides a placeholder.

---

## Suggested Next Improvements (pick one and I can implement it)

- Add a `.env` to make the API base URL configurable (don't hard-code `world.openfoodfacts.org`).
- Add unit tests for core components (`SearchBar`, `ProductCard`) using Jest + React Testing Library.
- Replace the "Load More" button with infinite scroll using `IntersectionObserver`.
- Add a service worker for basic offline caching of recent searches.

---

## Template Notes

This repo started from a project template. The original template instructions remain useful for editing via the platform or Codespaces. The app-specific info is above.

---

If you'd like, I can now:
- Run the project locally and confirm it builds and starts, or
- Implement one of the small improvements above (tests, .env, infinite-scroll), or
- Generate a brief developer quickstart (commit + deploy steps).

Tell me which next step you want me to take.

