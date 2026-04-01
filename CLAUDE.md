# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turkish-language mobile-first car delivery checklist app (Araç Teslim Kontrol Listesi) for dealership staff. Pure client-side SPA with localStorage persistence — no backend.

## Commands

```bash
npm run dev          # Dev server on localhost:8080
npm run build        # Production build (Vite)
npm run lint         # ESLint (flat config, TS/TSX only)
npm test             # Vitest run once
npm run test:watch   # Vitest watch mode
npm run preview      # Preview production build
```

## Architecture

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui (Radix primitives)

**Data flow:** Static checklist data → `useChecklist` hook (logic + localStorage persistence) → `Index.tsx` (UI + local filter/collapse state)

- `src/data/checklistData.ts` — Hardcoded 7 sections, ~58 items. Each item has `text` and `tag` (`"critical"` | `"tip"` | `null`). Types: `ChecklistSection`, `ChecklistItem`, `ItemTag`.
- `src/hooks/useChecklist.ts` — Core state hook. Persists to localStorage key `"car-checklist-state"` as `Record<string, boolean>` with keys like `"sectionIndex-itemIndex"` (e.g., `"0-0"`, `"2-5"`).
- `src/pages/Index.tsx` — Single main page. All UI in one component: sticky header with progress ring, filter chips (all/critical/tip), collapsible sections, checklist rows.
- `src/components/ui/` — shadcn/ui library (30+ components). Do not hand-edit; use `npx shadcn-ui add <component>` to add new ones.

**Routing:** React Router v6 in `App.tsx`. Single route `/` → Index. Add new routes above the `*` catch-all.

**Providers in App.tsx:** QueryClientProvider (React Query — installed but unused), TooltipProvider, Toaster, Sonner, BrowserRouter.

## Key Conventions

- **Path alias:** `@/*` maps to `src/*` (e.g., `import { cn } from "@/lib/utils"`)
- **TypeScript:** Strict mode is OFF (`tsconfig.app.json`). No strict null checks.
- **Styling:** Tailwind utility classes + HSL CSS variables in `index.css` for theming (light/dark via `.dark` class). Critical items use amber/orange; tip items use blue.
- **Icons:** Lucide React (`lucide-react`)
- **UI language:** All user-facing text is Turkish
