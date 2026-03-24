# Conversation Context — Bearing Spin Lab

## What We Built

A **6205 ball bearing visualization app** called "Bearing Spin Lab" with the following stack:

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Vite, TypeScript, Tailwind CSS v4, shadcn/ui |
| 3D (attempted) | Three.js via @react-three/fiber + @react-three/drei |
| 2D fallback (current) | SVG + CSS animations (container-safe) |
| Backend (planned) | Python FastAPI |
| Database | Couchbase — bucket `main`, collections: `bearing_specs`, `spin_presets`, `spin_runs` |
| Runtime | Polytope containerized sandbox, Bun runtime |

## Bearing Specs — 6205 Deep Groove

- Bore: 25 mm, OD: 52 mm, Width: 15 mm
- 9 balls, ⌀7.94 mm, pitch radius 19.25 mm

## What Was Completed

### Planning & Design
- `design-spec.md` — full spec with 8 functional reqs, 5 non-functional, 3-layer architecture, API contract (6 endpoints), 3 milestones
- `data-model.md` — 3 entities (bearing_specs, spin_presets, spin_runs), relationships, constraints, Mermaid ER diagram
- `coding-agent-rules.md` — Three.js conventions, Couchbase collection mappings, folder structure, commit rules, code style, testing strategy
- `config/couchbase-server/couchbase.yaml` — updated collections from placeholder to bearing-specific ones

### Milestone 1 — Frontend (partial)
- **Three.js deps installed**: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`
- **Components created**:
  - `Bearing6205.tsx` — 3D mesh geometry (torus-based rings + sphere balls) with animation
  - `BearingScene.tsx` — originally Three.js Canvas wrapper; **replaced with SVG/CSS fallback** due to WebGL not rendering in the containerized browser environment
  - `ControlPanel.tsx` — shadcn/ui controls: RPM slider (0–20, step 0.1), CW/CCW toggle, Play/Pause, Reset, status display
- **`home.tsx` updated** — header bar + viewport + sidebar layout, auto-play at 0.1 RPM

### Key Issue: WebGL Rendering Failure
Three.js Canvas rendered as a black box in the Polytope container environment. Multiple approaches tried:
1. LatheGeometry with metallic materials → black
2. Simplified TorusGeometry with meshBasicMaterial → black
3. Debug cube + axes helper → still black
4. Forced camera lookAt + OrbitControls target → still black

**Resolution**: Replaced with pure SVG/CSS bearing animation that works reliably in any browser context. The Three.js components (`Bearing6205.tsx`) are still in the codebase for future use outside containerized browsers.

### Service Binding Issue
The Polytope service registry was initially bound to `/labs/user-f6a1996d/lab2` (a different workspace). This caused `localhost:51732` to serve the old template app instead of the bearing app. Resolved by re-running the stack and using the correct exposed port.

## What Remains

### Milestone 1 — Finish
- Verify SVG bearing animation renders and responds to controls
- Consider enhancing SVG bearing with perspective transform for pseudo-3D look
- Commit frontend work

### Milestone 2 — Backend + Persistence
- FastAPI CRUD endpoints: POST/GET/PUT/DELETE `/api/presets`
- Couchbase integration for `spin_presets` collection
- Connect frontend controls to save/load presets

### Milestone 3 — Run History + Polish
- Record spin runs with duration tracking
- Run history list in UI
- Final visual polish and error handling

## File Map

```
services/react-web-app/app/
├── components/bearing/
│   ├── Bearing6205.tsx      # Three.js 3D bearing (unused — WebGL fails in container)
│   ├── BearingScene.tsx     # SVG/CSS animated bearing (active fallback)
│   └── ControlPanel.tsx     # shadcn/ui controls sidebar
├── routes/
│   └── home.tsx             # Main app route — viewport + controls
```

## Notes for Next Session
- The dev server runs inside the container on port 51732; Polytope exposes it on a dynamic host port (check `describe-service react-web-app` for current mapping)
- `run_in_terminal` for git commands may fail with ENOPRO error — use the bash terminal directly
- VS Code shows ~80 TypeScript errors — these are resolution failures because `node_modules` live inside the container, not on the local filesystem. Not real build errors.
- Production build compiles cleanly inside the container (`bun run react-router build`)
