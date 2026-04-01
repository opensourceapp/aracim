# Contributing to Aracim

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
git clone https://github.com/opensourceapp/aracim.git
cd aracim
npm install
npm run dev
```

The dev server runs at `http://localhost:8080`.

## Making Changes

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Ensure linting passes:
   ```bash
   npm run lint
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Verify the build works:
   ```bash
   npm run build
   ```

## Commit Messages

Use clear, descriptive commit messages:

```
Add filter for unchecked items
Fix progress calculation when section is empty
Update Turkish translations for engine section
```

Prefix with a verb in imperative mood. No need for conventional commits prefixes — keep it simple and readable.

## Pull Requests

- Keep PRs focused on a single change
- Fill out the PR template
- Link related issues with `Closes #123`
- Ensure CI checks pass before requesting review

## Code Style

- **TypeScript** for all source files
- **Tailwind CSS** utility classes for styling (no custom CSS unless necessary)
- **Path aliases**: use `@/` imports (e.g., `@/hooks/useChecklist`)
- **shadcn/ui**: do not hand-edit files in `components/ui/` — use `npx shadcn-ui add <component>` to add new components
- **Turkish**: all user-facing text must be in Turkish

## Adding Checklist Items

Checklist data lives in `src/data/checklistData.ts`. Each item has:

```typescript
{ text: "Item description in Turkish", tag: "critical" | "tip" | null }
```

- `critical` — safety or legal items (shown in amber)
- `tip` — helpful but optional (shown in blue)
- `null` — standard items

## Reporting Bugs

Use the [bug report template](https://github.com/opensourceapp/aracim/issues/new?template=bug_report.yml) on GitHub Issues. Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser and device info (this is a mobile-first app)

## Suggesting Features

Use the [feature request template](https://github.com/opensourceapp/aracim/issues/new?template=feature_request.yml) on GitHub Issues.
