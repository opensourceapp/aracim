# Aracim - Arac Teslim Kontrol Listesi

[![Deploy](https://github.com/opensourceapp/aracim/actions/workflows/deploy.yml/badge.svg)](https://github.com/opensourceapp/aracim/actions/workflows/deploy.yml)
[![CI](https://github.com/opensourceapp/aracim/actions/workflows/ci.yml/badge.svg)](https://github.com/opensourceapp/aracim/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Mobile-first new car delivery checklist web app for dealership staff. Helps ensure every inspection item is verified before handing over the vehicle.

**[Live Demo](https://opensourceapp.github.io/aracim)**

## Features

- **7 inspection sections** with ~58 checklist items covering documents, exterior, interior, electronics, engine, test drive, and final checks
- **Tag-based filtering** — filter by critical items or tips
- **Progress tracking** — circular indicator + progress bar with per-section counters
- **Persistent state** — all progress saved in localStorage, survives page reloads
- **Collapsible sections** — expand/collapse each section independently
- **Completion celebration** — banner appears when all items are checked
- **Reset with confirmation** — clear all progress with a safety dialog
- **Mobile-optimized** — 48px minimum tap targets, designed for on-site use

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (SWC) |
| Styling | Tailwind CSS 3 |
| Components | shadcn/ui (Radix primitives) |
| Icons | Lucide React |
| Routing | React Router v6 |
| Testing | Vitest + Testing Library + Playwright |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/opensourceapp/aracim.git
cd aracim
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:8080](http://localhost:8080).

### Build

```bash
npm run build
npm run preview    # preview the production build locally
```

### Testing

```bash
npm test             # run once
npm run test:watch   # watch mode
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
  data/checklistData.ts    # Checklist sections & items (static data + types)
  hooks/useChecklist.ts    # Core state management hook (toggle, reset, persistence)
  pages/Index.tsx          # Main checklist page (single-page app)
  components/ui/           # shadcn/ui component library
  lib/utils.ts             # Tailwind class merge utility (cn)
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
