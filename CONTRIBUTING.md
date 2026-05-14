# Contributing

Thank you for helping improve Doe Sangue Angola.

## Project Rules

- Keep Portuguese as the primary interface language.
- Keep every source file under 250 lines.
- Use TypeScript for app and package code.
- Prefer shared services, shared types and agents over duplicated logic.
- Do not connect real backend services without a reviewed plan.
- Keep mock mode working for demos.

## Before You Start

1. Read `README.md`.
2. Read `ARCHITECTURE.md`.
3. Run `npm install`.
4. Run `npm run typecheck` to confirm the project is healthy.

## Development Flow

1. Create a small branch for the change.
2. Keep changes focused.
3. Add or update tests for business logic changes.
4. Run the checks before opening a pull request.

```bash
npm run check:lines
npm run audit
npm run lint
npm run test
npm run typecheck
```

## Pull Request Checklist

- UI text remains Portuguese-first.
- No source file exceeds 250 lines.
- No unrelated refactors are included.
- Mock data still works.
- Admin, Hospital and Mobile flows still build.
- Docs are updated when behavior changes.

## Code Style

- Pages compose small components.
- Components stay focused and reusable.
- Business rules belong in `packages/agents`.
- Shared data access belongs in `packages/shared-services`.
- Shared contracts belong in `packages/shared-types`.
