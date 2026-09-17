[README.md](https://github.com/user-attachments/files/32314600/README.1.md)
# DevTracker

A full-stack development tracking platform — think a lightweight Jira/Linear. Teams create projects, break work into trackable items, move them through a status pipeline on a Kanban board, and collaborate in real time.

**[[Live Demo](https://devtrack-2-ebrr.onrender.com/)](#)** · **[API Docs (Swagger)](#)**

![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

---

## Overview

DevTracker is a monorepo containing two projects, built into a single combined Docker image for deployment:

| | |
|---|---|
| **Backend** | ASP.NET Core (.NET 10) Web API — layered architecture, JWT auth, PostgreSQL via EF Core, real-time updates via SignalR |
| **Frontend** | React 18 + TypeScript + Vite — Kanban board with drag-and-drop, optimistic updates, live collaboration |

The production build serves the React app as static files from the API's `wwwroot`, so the whole app runs as one process, one port, and one deployment — no CORS to configure, since everything shares the same origin.

## Features

- **Authentication** — JWT-based, PBKDF2 password hashing
- **Projects & teams** — each project has its own membership list and role hierarchy (Owner → Maintainer → Contributor → Viewer)
- **Work items** — Epics, Stories, Tasks, and Bugs, auto-numbered per project (`DEV-1`, `DEV-2`, …)
- **Kanban board** — drag-and-drop between statuses (Backlog → To do → In progress → In review → Done), with optimistic UI updates that roll back automatically if the server rejects a change
- **Real-time collaboration** — work item changes broadcast instantly to every connected client on the same board via SignalR, no polling or manual refresh
- **Comments & activity history** — every status/field change is logged automatically with who changed what and when
- **Role-based authorization** — enforced server-side on every endpoint, not just hidden in the UI

## Architecture

```
Frontend (React)  ──HTTPS + WebSocket──▶  Backend (.NET)  ──▶  PostgreSQL
                                              │
                                    ┌─────────┼─────────┐
                                   Api   Application  Infrastructure
                                              │
                                           Domain
```

The backend follows a layered architecture with a strict dependency direction:

- **`DevTracker.Domain`** — entities and enums, depends on nothing else in the solution
- **`DevTracker.Application`** — DTOs and service interfaces, defines the contracts
- **`DevTracker.Infrastructure`** — EF Core, PostgreSQL, JWT signing, the only layer that knows these technologies exist
- **`DevTracker.Api`** — controllers, SignalR hub, Swagger, the HTTP surface

This means swapping a data store or auth mechanism only ever touches `Infrastructure`, never the API contract or the frontend.

## Tech stack

**Backend**
- ASP.NET Core 10, C#
- Entity Framework Core (Code-First migrations) + PostgreSQL
- JWT Bearer authentication, PBKDF2 password hashing
- SignalR for real-time updates
- Swagger / OpenAPI

**Frontend**
- React 18, TypeScript, Vite
- React Router
- Tailwind CSS
- `@microsoft/signalr` client

**Infra**
- Docker (single combined multi-stage build)
- Render (hosting + managed Postgres)

## Project structure

```
DevTracker/
├── Dockerfile                      # combined build: React -> wwwroot, then .NET
├── BackEnd/
│   ├── DevTracker.sln
│   └── src/
│       ├── DevTracker.Domain/          # Entities, enums
│       ├── DevTracker.Application/     # DTOs, service interfaces
│       ├── DevTracker.Infrastructure/  # EF Core, auth, service implementations
│       └── DevTracker.Api/             # Controllers, SignalR hub, Program.cs
└── FrontEnd/
    ├── src/
    │   ├── components/             # Shared UI, board, drawers, modals
    │   ├── lib/                    # API client, auth context, SignalR
    │   ├── pages/                  # Login, Register, Projects, Board
    │   └── types/                  # TypeScript types mirroring backend DTOs
    └── vite.config.ts
```

## Getting started locally

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- PostgreSQL running locally (or update the connection string to point elsewhere)

### 1. Backend

```bash
cd BackEnd
dotnet restore
```

Update `src/DevTracker.Api/appsettings.json` with your local Postgres connection string and a JWT secret:

```json
"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=devtracker;Username=postgres;Password=yourpassword"
},
"Jwt": {
  "Secret": "a-long-random-string-at-least-32-characters"
}
```

Apply migrations and run:

```bash
dotnet ef database update --project src/DevTracker.Infrastructure --startup-project src/DevTracker.Api
dotnet run --project src/DevTracker.Api/DevTracker.Api.csproj
```

The API starts on `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger`.

### 2. Frontend

```bash
cd FrontEnd
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Opens on `http://localhost:5173`.

## Running with Docker

The repo builds into a single image — the root `Dockerfile` builds the React app and copies its output into the ASP.NET Core app's `wwwroot`, so one image serves both the UI and the API.

```bash
# from the repo root
docker build -t devtracker .
docker run -p 8080:8080 --env-file .env devtracker
```

Open `http://localhost:8080` — the UI and API are both served from there.

## Environment variables (production)

| Variable | Description |
|---|---|
| `ConnectionStrings__Default` | PostgreSQL connection string |
| `Jwt__Secret` | Secret used to sign JWTs |
| `Jwt__Issuer` / `Jwt__Audience` | JWT issuer/audience |
| `PORT` | Injected automatically by Render |

## API overview

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` / `/api/auth/login` | Auth |
| GET / POST | `/api/projects` | List / create projects |
| GET / POST | `/api/projects/{id}/members` | Manage project membership |
| GET / POST | `/api/projects/{id}/workitems` | List / create work items |
| PATCH | `/api/projects/{id}/workitems/{itemId}/status` | Move a work item's status |
| GET / POST | `/api/projects/{id}/workitems/{itemId}/comments` | Comments |
| GET | `/api/projects/{id}/workitems/{itemId}/activity` | Change history |
| GET | `/api/users/search?q=` | Search users to add as members |

Full interactive documentation is available via Swagger once the backend is running.

## License

MIT
