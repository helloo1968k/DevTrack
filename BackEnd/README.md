# DevTracker API

A development tracking backend (issue / task tracker, à la a lightweight Jira) built with **.NET 10** and ASP.NET Core Web API.

> **Note:** This was generated in a sandbox without the .NET 10 SDK or network access, so it has **not** been compiled/run here. Build it locally with the .NET 10 SDK — see below.

## Architecture

Clean, layered solution:

```
DevTracker.sln
src/
  DevTracker.Domain/          # Entities & enums, no dependencies
  DevTracker.Application/     # DTOs, service interfaces, exceptions
  DevTracker.Infrastructure/  # EF Core (SQLite), JWT auth, service implementations
  DevTracker.Api/             # Controllers, Program.cs, Swagger
```

## Features

- **Auth**: register/login with JWT bearer tokens, PBKDF2 password hashing
- **Projects**: create/update/delete, membership with roles (Owner, Maintainer, Contributor, Viewer)
- **Work items**: Epics/Stories/Tasks/Bugs, status workflow (Backlog → ToDo → InProgress → InReview → Done/Cancelled), priorities, assignees, parent/child sub-tasks, due dates, estimates
- **Auto-numbered codes**: e.g. `DEV-1`, `DEV-2` per project
- **Comments** on work items
- **Activity log**: every status/title/priority/assignee change is recorded per work item
- **Filtering & pagination** on work item lists (status, type, priority, assignee, search)
- **Swagger UI** with JWT auth support
- Centralized exception-handling middleware mapping domain exceptions to proper HTTP status codes

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

## Run it

```bash
cd DevTracker
dotnet restore
dotnet run --project src/DevTracker.Api
```

The API starts on `http://localhost:5080` (see `launchSettings.json`) and opens Swagger at `/swagger`. A SQLite database file (`devtracker.db`) is created automatically on first run via `EnsureCreated()`.

> For production, swap `EnsureCreated()` for proper EF Core migrations:
> ```bash
> dotnet tool install --global dotnet-ef
> dotnet ef migrations add InitialCreate --project src/DevTracker.Infrastructure --startup-project src/DevTracker.Api
> dotnet ef database update --project src/DevTracker.Infrastructure --startup-project src/DevTracker.Api
> ```

**Before deploying:** change `Jwt:Secret` in `appsettings.json` (or override via `dotnet user-secrets` / environment variable `Jwt__Secret`) to a long random value.

## API overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Get a JWT |
| POST | `/api/projects` | Create a project (creator becomes Owner) |
| GET | `/api/projects` | List projects you're a member of |
| GET | `/api/projects/{id}` | Get a project |
| PUT | `/api/projects/{id}` | Update a project (Maintainer+) |
| DELETE | `/api/projects/{id}` | Delete a project (Owner only) |
| GET/POST | `/api/projects/{id}/members` | List / add members |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove a member |
| POST | `/api/projects/{id}/workitems` | Create a work item |
| GET | `/api/projects/{id}/workitems?status=&type=&priority=&assigneeId=&search=&page=&pageSize=` | List/filter work items |
| GET | `/api/projects/{id}/workitems/{itemId}` | Get a work item |
| PUT | `/api/projects/{id}/workitems/{itemId}` | Update a work item |
| PATCH | `/api/projects/{id}/workitems/{itemId}/status` | Move status (e.g. drag on a board) |
| DELETE | `/api/projects/{id}/workitems/{itemId}` | Delete a work item |
| GET | `/api/projects/{id}/workitems/{itemId}/activity` | Change history |
| GET/POST | `/api/projects/{id}/workitems/{itemId}/comments` | List / add comments |
| DELETE | `/api/comments/{id}` | Delete your own comment |

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

## Example flow

```bash
# Register
curl -X POST http://localhost:5080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"P@ssw0rd!","fullName":"Alice Dev"}'

# Login -> copy the "token" field
curl -X POST http://localhost:5080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"P@ssw0rd!"}'

# Create a project
curl -X POST http://localhost:5080/api/projects \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Dev Tracker","key":"DEV","description":"Internal tracker"}'

# Create a work item
curl -X POST http://localhost:5080/api/projects/1/workitems \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"title":"Set up CI pipeline","description":"","type":2,"priority":1}'

# Move it to In Progress (WorkItemStatus.InProgress = 2)
curl -X PATCH http://localhost:5080/api/projects/1/workitems/1/status \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"status":2}'
```

## Enum reference

- `WorkItemType`: `0` Epic, `1` Story, `2` Task, `3` Bug
- `WorkItemStatus`: `0` Backlog, `1` ToDo, `2` InProgress, `3` InReview, `4` Done, `5` Cancelled
- `WorkItemPriority`: `0` Low, `1` Medium, `2` High, `3` Critical
- `ProjectRole`: `0` Owner, `1` Maintainer, `2` Contributor, `3` Viewer
- `UserRole`: `0` Admin, `1` Manager, `2` Developer, `3` Viewer

## Suggested next steps

- Add EF Core migrations instead of `EnsureCreated`
- Add refresh tokens / token revocation
- Add integration tests (`WebApplicationFactory`)
- Add a `/api/dashboard` endpoint for burndown/velocity stats
- Containerize with a `Dockerfile` + docker-compose (Postgres instead of SQLite for prod)
