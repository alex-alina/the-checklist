# Checklist App

Monorepo for a checklist application consisting of a React frontend and an Express/TypeORM backend.

## Setup
1. Copy `.env.example` to `.env`.
2. Start Postgres:
   ```sh
   npm run docker:up
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Workspaces
- **backend**: `npm run dev --workspace backend` will start the Express server on `:4000`. Run `npm run test --workspace backend` for unit tests and `npm run lint --workspace backend` for linting.
- **frontend**: `npm run dev --workspace frontend` starts the Vite dev server on `:5173`. Use `npm run test --workspace frontend` for the React tests and `npm run lint --workspace frontend` for linting.

## Convenience
- `npm run lint` / `npm run test` run workspace commands in sequence.
- `npm run format` applies Prettier across the repo.
