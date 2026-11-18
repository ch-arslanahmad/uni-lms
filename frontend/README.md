# frontend

React + TypeScript app for uni-lms. It talks to `../backend/` and never to the database directly.

## Stack

- **Language:** TypeScript, React
- **Styling:** Tailwind CSS v4 + `shadcn/ui`
- **Routing:** React Router v7 (install react-router)
- **State:** React Context for `auth` and the current user; mock data behind a small `src/api/` layer

## Phase 1 — local data

Runs on mock data from `src/mock/`, so the UI can be built before the API exists.

- three screens with navigation,
- one dynamic route for an assignment detail page,
- a CRUD list (announcements) without mutating existing state,
- a form with validation and visible errors,
- one piece of shared state (current user and role) through context.

## Phase 2 — API

Replaces the mock layer with the API in `../backend/`. Every request gets loading, error and empty states; the base URL comes from an env file.

## Rules

- Display logic and data logic stay apart. No business rules inside JSX.
- No duplicated state that can drift.
- No screen that renders nothing without a message.

## Commands

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm run preview  # preview the production build
```
