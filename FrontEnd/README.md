# DevTracker — Frontend

A premium, modern React client for the [DevTracker API](../DevTracker) — a development tracking tool (projects, work items, a Kanban board, comments, and activity history).

> Built in a sandbox without network access, so `npm install` has not been run here. Everything is source-complete — install and run it locally.

## Design

The visual identity is built around one signature element: a **status rail** — a vertical thread carrying the workflow's own colors (Backlog → To do → In progress → In review → Done) — used as the sidebar's edge, the auth screen's centerpiece, and the left border of every work item card. It's the idea that every task has a place on a continuous line, not just a column.

- **Palette**: deep ink navy (`#0B0E14` / `#12161F` / `#1B212D`) with a warm brass accent (`#D4A24E`) instead of the usual dev-tool blue.
- **Type**: Fraunces (serif display) for headings, Inter for UI text, JetBrains Mono for item codes like `DEV-42` and data.
- **Motion**: a slow light pulse travels the rail on the auth screen; cards lift subtly on hover; drawers and modals fade up. Respects `prefers-reduced-motion`.

## Stack

- React 18 + TypeScript + Vite
- React Router v6
- Tailwind CSS (custom token system in `tailwind.config.js`)
- Plain `fetch` API client (no extra data-fetching library) with JWT stored in `localStorage`

## Setup

Requires Node.js 18+.

```bash
cd devtracker-frontend
npm install
cp .env.example .env   # point VITE_API_URL at your running DevTracker API
npm run dev
```

Opens at `http://localhost:5173`. Make sure the [DevTracker API](../DevTracker) is running (default `http://localhost:5080`) and that its CORS policy allows this origin — the backend's default config already allows any origin.

## Structure

```
src/
  components/     # Shared UI: AppShell, StatusRail (signature), Badges, Basics (Avatar/Button), modals, drawer
  lib/             # api.ts (fetch client), auth-context.tsx
  pages/           # LoginPage, RegisterPage, ProjectsPage, BoardPage
  types/           # TypeScript types mirroring the backend DTOs/enums exactly
```

## What's implemented

- **Auth**: register/login backed by the API's JWT endpoints, persisted session, protected routes
- **Projects dashboard**: grid of project cards, create-project modal
- **Kanban board**: columns per status, drag-and-drop between columns (optimistic update with rollback on failure), search/filter
- **Work item drawer**: inline status pipeline, editable description/priority/assignee, comments thread, activity history tab, delete
- **Create work item modal**: title, description, type, priority, assignee

## Notes / next steps

- The board fetches up to 200 items per project (`pageSize=200`); for very large projects, add real pagination or infinite scroll.
- No optimistic UI for comments/description edits beyond the drawer's own local state — a toast/error banner system would be a good next addition.
- Add member-invite UI (the backend already supports `POST /api/projects/{id}/members`).
