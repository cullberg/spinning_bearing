# Bearing Spin Lab — Running Locally

Interactive 6205 ball bearing simulation with load deflection, housing, and grease pump visualization.

## Quick Start

Requires [Node.js](https://nodejs.org/) (v18+). From the repo root:

```bash
cd services/react-web-app
npm install        # install dependencies (first time only)
node serve.js      # start the server
```

Open http://localhost:3000 (override with `PORT=8080 node serve.js`).

## Why not a simple static server?

React Router v7 requires the **server bundle** to generate the initial HTML shell (even in SPA mode). A plain `python3 -m http.server` won't work. The included `serve.js` uses `@react-router/node` to handle this.

## Development (with hot reload)

Requires [Bun](https://bun.sh):

```bash
cd services/react-web-app
bun install
bun run dev
```

## Notes

- The app is a client-side SPA — no backend API required.
- All rendering happens in the browser after the initial shell loads.
