#!/usr/bin/env node

/**
 * SPA Static File Server
 *
 * Node.js server for the React Router SPA build.
 * Uses the server bundle to render the initial HTML shell,
 * then serves static assets from build/client/.
 *
 * Requires: react, react-dom, react-router, @react-router/node, isbot
 * (already installed as project dependencies)
 *
 * Usage:
 *   node serve.js              # listens on port 3000
 *   PORT=8080 node serve.js    # custom port
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequestHandler } from "@react-router/node";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLIENT_DIR = join(__dirname, "build", "client");
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

/** Serve a static file or return null */
async function serveStatic(pathname) {
  const safePath = join(CLIENT_DIR, decodeURIComponent(pathname));
  if (!safePath.startsWith(CLIENT_DIR)) return null;

  try {
    const info = await stat(safePath);
    if (!info.isFile()) return null;
    const data = await readFile(safePath);
    const ext = extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const headers = { "Content-Type": contentType };
    if (pathname.startsWith("/assets/")) {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }
    return { data, headers, status: 200 };
  } catch {
    return null;
  }
}

async function main() {
  // Import the server build to get the React Router request handler
  const serverBuild = await import("./build/server/index.js");
  const handleReactRouter = createRequestHandler(serverBuild);

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }

    // Try static files first (assets, favicon, etc.)
    const staticResult = await serveStatic(pathname);
    if (staticResult) {
      res.writeHead(staticResult.status, staticResult.headers);
      res.end(req.method === "HEAD" ? undefined : staticResult.data);
      return;
    }

    // Fall through to React Router for the SPA shell
    try {
      const webReq = new Request(url.href, {
        method: req.method,
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(([, v]) => v != null)
        ),
      });

      const webRes = await handleReactRouter(webReq);

      res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));
      if (req.method === "HEAD") {
        res.end();
      } else {
        const body = await webRes.arrayBuffer();
        res.end(Buffer.from(body));
      }
    } catch (err) {
      console.error("React Router handler error:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });

  server.listen(PORT, () => {
    console.log(`SPA server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
