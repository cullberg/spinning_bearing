# Bearing Spin Lab — Running Locally

Interactive 6205 ball bearing simulation with load deflection, housing, and grease pump visualization.

## Quick Start (static build)

The `build/client/` directory contains the pre-built SPA with a static `index.html`.

### Python (no install needed)

```bash
cd services/react-web-app/build/client
python3 -m http.server 3000
```

Open http://localhost:3000

### Node.js (with the included server)

```bash
cd services/react-web-app
node serve.js
```

Open http://localhost:3000 (override with `PORT=8080 node serve.js`)

### npx (one-liner)

```bash
npx serve services/react-web-app/build/client
```

## Development (with hot reload)

Requires [Bun](https://bun.sh):

```bash
cd services/react-web-app
bun install
bun run dev
```

## Notes

- The app is a client-side SPA — no backend required.
- ES modules need an HTTP server; opening `index.html` via `file://` won't work due to browser CORS restrictions.
