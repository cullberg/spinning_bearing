# System Design Specification

> Fill in each section below to describe what you're building. This document
> will serve as the single source of truth for your project scope and
> architecture decisions.

## 1. Project Overview

Bearing Spin Lab is a small full stack web app that visualizes a standard 6205 ball bearing in 3D and lets users run, tune, and save spin presets. It is built for workshop use: a React + Vite frontend renders the bearing animation (Three.js), a FastAPI backend stores presets and run summaries, and Couchbase persists a small set of related documents.

## 2. Problem Statement

For demo and learning use, quick bearing motion prototypes are often spread across throwaway scripts with no repeatable parameters. This makes it hard to compare speed settings, preserve demo states, or show consistent results across sessions. We need a simple, containerized app where bearing spin parameters can be adjusted visually and saved/replayed reliably.

## 3. Functional Requirements

<!-- List the concrete things the system must do. Use "The system shall…" phrasing. -->

- [x] The system shall render a 3D 6205 bearing model (25 mm ID, 52 mm OD, 15 mm width) in the browser.
- [x] The system shall animate the inner ring and rolling elements with configurable RPM.
- [x] The system shall allow users to start, pause, and reset animation state.
- [x] The system shall allow users to change direction (clockwise/counterclockwise).
- [x] The system shall allow users to create and save named spin presets.
- [x] The system shall allow users to list and load existing presets.
- [x] The system shall record each run summary (preset, duration, average RPM) for simple history.
- [x] The system shall expose REST endpoints for preset CRUD and run logging.

## 4. Non-Functional Requirements

<!-- Performance, scalability, security, accessibility, etc. -->

- [x] UI animation shall remain visually smooth on a typical laptop (target 50+ FPS during idle spin).
- [x] API responses for preset CRUD shall return in under 300 ms in local workshop environment.
- [x] The app shall be responsive on desktop and tablet widths.
- [x] The system shall run locally via Polytope containers without external managed services.
- [x] The app shall not implement authentication or user accounts (workshop scope constraint).

## 5. System Architecture

Architecture is a 3-layer setup:

1. Frontend (React + Vite + Three.js) renders the 3D bearing scene and control panel.
2. Backend (FastAPI) provides REST APIs for presets and run history.
3. Database (Couchbase) stores documents for bearing specs, presets, and run logs.

Communication is HTTP/JSON from frontend to backend; backend uses Couchbase SDK for persistence.

## 6. Components

<!-- For each component, describe its responsibility and public interface. -->

| Component | Responsibility | Exposes |
|-----------|---------------|---------|
| React Web App | 3D rendering, controls, preset UI, history display | Routes (`/`, `/history`), API client calls |
| Bearing Scene Module | Builds 6205 geometry and animation loop | `setRpm`, `setDirection`, `play`, `pause`, `reset` |
| FastAPI Service | Validation and business logic for presets and runs | `/api/presets`, `/api/presets/{id}`, `/api/runs` |
| Couchbase Client Layer | Read/write document collections | Repository methods for specs/presets/runs |

## 7. Data Flow

<!-- Describe the main user flows end-to-end. What happens when a user
     performs the primary action? -->

1. User loads app; frontend initializes default 6205 spec and requests presets from backend.
2. User adjusts controls (RPM/direction), starts animation, and optionally saves a preset.
3. Frontend sends preset create/update requests to API; API validates and stores documents in Couchbase.
4. On stop/reset, frontend posts run summary; API writes run record and returns updated history.
5. User loads a saved preset; frontend applies parameters to the running Three.js scene.

## 8. Client-Server Relationships

Client responsibilities:

- Render 3D scene and controls.
- Perform input validation for UX (basic ranges, required name fields).
- Call backend APIs and apply returned state.

Server responsibilities:

- Validate payloads and enforce constraints.
- Persist/retrieve documents from Couchbase.
- Return stable JSON response schemas.

Protocol:

- HTTP REST over JSON.

API contract (v1):

- `GET /api/presets` -> list presets.
- `POST /api/presets` -> create preset.
- `PUT /api/presets/{id}` -> update preset.
- `DELETE /api/presets/{id}` -> delete preset.
- `GET /api/runs` -> list recent runs.
- `POST /api/runs` -> log run summary.

## 9. Invariances & Constraints

<!-- Rules that must always hold true in the system. Think about data integrity,
     business rules, and security boundaries. -->

- Bearing spec for MVP is fixed to 6205 dimensions (25/52/15 mm) unless explicitly expanded.
- RPM must be within allowed range (for example 0-6000) and stored as a positive numeric value.
- Direction is enum-like: `cw` or `ccw` only.
- Preset names must be unique within the app dataset.
- Run records must reference an existing preset id or explicit default preset marker.
- No authentication, no multi-user assumptions, and no external third-party integrations.

## 10. Milestones

<!-- Break the work into shippable increments. Each milestone should be
     demoable on its own. -->

| # | Milestone | Deliverable | Definition of Done |
|---|-----------|-------------|-------------------|
| 1 | 3D Bearing MVP | Static 6205 geometry + spin controls | User can see bearing, change RPM, start/pause/reset |
| 2 | Preset Persistence | FastAPI + Couchbase preset CRUD | Presets can be saved, listed, loaded, updated, deleted |
| 3 | Run History + Polish | Run logging and UI refinement | Runs are recorded and shown, app is responsive and demo-ready |
