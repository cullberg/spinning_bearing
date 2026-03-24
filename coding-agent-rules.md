# Coding Agent Rules

> These rules tell your AI coding assistant how to behave in this project.
> Fill in the placeholder sections so the agent produces consistent,
> high-quality code that matches your team's conventions.

---

## 0. Project Scope (read this first)

This is a **workshop project**. It must stay within the boundaries of a
**simple, self-contained full stack web app**. The goal is to ship something
working, not something impressive on a whiteboard.

### What is in scope

| Layer | This project |
|-------|-------------|
| Frontend | React + Vite SPA with React Router (a few pages/routes) |
| Backend | A single FastAPI server with a handful of REST endpoints |
| Database | Couchbase — a small number of document collections (aim for 2–4) |
| Auth | **Out of scope for this workshop** — skip authentication entirely |
| Relationships | Model references between documents (e.g. store an id field); avoid deeply nested or highly relational data |
| Runtime | Containerized via Polytope; inspect running services with the Polytope MCP tools |

### What is out of scope

The agent must refuse to design or implement any of the following. If the
user's requirements imply one of these, the agent should flag it and propose a
simpler alternative instead.

- Authentication or user accounts of any kind (login, sessions, JWT, OAuth)
- Multiple backend services / microservices
- Real-time features (WebSockets, Server-Sent Events, live dashboards)
- File upload or cloud object storage (S3, GCS, etc.)
- Background job queues
- In-memory caching layers (Redis, Memcached)
- Full-text or faceted search beyond Couchbase's built-in N1QL queries
- Payment processing, email/SMS delivery, or other third-party service integrations
- AI / ML model inference or training
- Mobile apps or native desktop apps
- Multi-tenant or role-based permission systems

> **Rule of thumb:** if implementing the feature requires a third managed
> cloud service, a separate daemon process, or a protocol other than HTTP/REST,
> it is out of scope. Simplify the requirement until it fits.

---

## 1. Project Conventions

- **Frontend:** TypeScript · React · Vite · React Router
- **3D Rendering:** Three.js via `@react-three/fiber` and `@react-three/drei` — used for the bearing scene and animation loop
- **Backend:** Python · FastAPI
- **Database:** Couchbase (document store — use the Couchbase Python SDK)
  - Bucket: `main`, Scope: `_default`
  - Collections: `bearing_specs`, `spin_presets`, `spin_runs`
- **Runtime:** Polytope (containerized); use the Polytope MCP tools to inspect
  running services, logs, and container state
- **Package managers:** `npm` (frontend) · `pip` / `uv` (backend). Add dependencies using MCP. 

## 2. File & Folder Structure

```
project/
├── services/
│   ├── react-web-app/
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── app.css
│   │   ├── public/
│   │   └── package.json
│   ├── python-fast-api/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   └── requirements.txt
│   └── service-config-manager/
├── config/
│   └── service-config-manager/
├── clients/
├── models/
└── test/
  └── python/
```

- Frontend route-level components go in `services/react-web-app/app/routes`.
- Reusable frontend UI components go in `services/react-web-app/app/components`.
- Backend API endpoint modules go in `services/python-fast-api/src/api`.
- Backend data models/schemas go in `services/python-fast-api/src/models`.
- Integration or seed scripts go in `test/python/<test-name>`.

## 3. Commit Practices

<!-- How should commits be structured? Conventional commits? Signed? -->

- **After every change:** Commit all changes immediately after completing each task
  - Only proceed if there are **no errors in logs** (check using `get_errors()`)
  - Commits must include all modified/created files
  - Commit message format: Brief, descriptive summary of what changed (e.g., "Add user endpoints", "Fix Couchbase config")
- Branch naming: Use main branch (no feature branches for workshop)

## 4. Code Style

- Formatting:
  - TypeScript/React: 2-space indentation, semicolons enabled, strict TS.
  - Python: PEP8, 4-space indentation, type hints for public functions.
  - Keep functions small and single-purpose.
- Naming:
  - React components: `PascalCase`.
  - TS/JS variables and functions: `camelCase`.
  - Python functions/variables/modules: `snake_case`.
  - API paths: lowercase kebab-case nouns (for example `/api/spin-presets`).
- Patterns to prefer:
  - Thin route handlers, logic in service modules.
  - Explicit request/response schemas.
  - Early validation with clear error messages.
  - Deterministic defaults (for example default 6205 preset).
- Anti-patterns to avoid:
  - Large monolithic components or route handlers.
  - Hidden global mutable state.
  - Premature abstractions and generic frameworks.
  - Silent exception swallowing.

## 5. Testing Strategy

- Test framework:
  - Backend: `pytest`.
  - Frontend: component/logic tests only if test setup is already present; otherwise keep manual verification for workshop speed.
- Coverage expectations:
  - Prioritize critical paths over percentage goals in workshop timeline.
  - Minimum expectation: API CRUD happy paths + one invalid-input case per endpoint.
- What to test:
  - Preset CRUD behavior and validation ranges (RPM/direction/name uniqueness).
  - Run logging behavior (`start/end/duration` consistency).
  - Frontend control panel applies RPM/direction correctly to scene state.
  - Regression check that app boots with no runtime or lint errors.

## 6. AI Assistant Guardrails

<!-- Boundaries for the coding agent: what it should and shouldn't do
     autonomously. -->

- Always: check Section 0 before designing a new feature — if it falls outside
  workshop scope, stop and propose a simpler alternative before writing any code.
- Always: prefer the simplest data model and fewest endpoints that satisfy the
  requirement. Three lines of code beat a premature abstraction.
- Always: use the Polytope MCP tools to inspect the running stack (logs,
  container status, env vars) before assuming something is misconfigured.
- Never: implement any form of authentication, user accounts, or authorization —
  this is explicitly out of scope for the workshop.
- Never: introduce a dependency, service, or architectural pattern listed in
  Section 0's "out of scope" list.
- Never: add features, error handling, or configuration that was not explicitly
  requested — scope creep is the main risk in a workshop setting.
- Ask before: adding any new third-party library or service integration.
- Ask before: creating more than one backend service or adding a non-HTTP
  communication channel.
