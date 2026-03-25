#!/usr/bin/env node

/**
 * SPA Static File Server
 *
 * Zero-dependency Node.js server for the React Router SPA build.
 * Serves static files from build/client/ and falls back to a
 * generated index.html for client-side routing.
 *
 * Usage:
 *   node serve.js              # listens on port 3000
 *   PORT=8080 node serve.js    # custom port
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

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
  ".eot": "application/vnd.ms-fontobject",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/** Build the SPA shell HTML from the Vite manifest */
async function buildIndexHtml() {
  const manifestPath = join(CLIENT_DIR, ".vite", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));

  // Collect all CSS and JS files needed for the initial load
  const cssFiles = new Set();
  const jsFiles = new Set();

  function collectAssets(key) {
    const entry = manifest[key];
    if (!entry) return;
    if (entry.css) entry.css.forEach((c) => cssFiles.add("/" + c));
    if (entry.file) jsFiles.add("/" + entry.file);
    if (entry.imports) {
      entry.imports.forEach((imp) => {
        const dep = manifest[imp];
        if (dep) {
          if (dep.css) dep.css.forEach((c) => cssFiles.add("/" + c));
          jsFiles.add("/" + dep.file);
        }
      });
    }
  }

  // Process all entry points
  for (const [key, value] of Object.entries(manifest)) {
    if (value.isEntry) collectAssets(key);
  }

  const cssLinks = [...cssFiles]
    .map((href) => `    <link rel="stylesheet" href="${href}">`)
    .join("\n");

  const entryModule = Object.values(manifest).find(
    (v) => v.isEntry && v.src && v.src.includes("entry.client")
  );
  const entryScript = entryModule ? "/" + entryModule.file : "";

  // Find the React Router manifest JS file (manifest-*.js)
  const { readdir } = await import("node:fs/promises");
  const assetsDir = join(CLIENT_DIR, "assets");
  const assetFiles = await readdir(assetsDir);
  const manifestJsName = assetFiles.find((f) => f.startsWith("manifest-") && f.endsWith(".js"));
  const manifestJsSrc = manifestJsName ? "/assets/" + manifestJsName : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bearing Spin Lab</title>
    <link rel="icon" href="/favicon.ico">
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    <script src="${manifestJsSrc}"></script>
    <script type="module">
      var manifest = window.__reactRouterManifest;
      var routeModules = {};
      var entries = Object.entries(manifest.routes);
      await Promise.all(entries.map(async function(e) {
        routeModules[e[0]] = await import(e[1].module);
      }));
      window.__reactRouterRouteModules = routeModules;
      window.__reactRouterContext = {
        state: { loaderData: {}, actionData: null, errors: null },
        future: { v8_middleware: false },
        isSpaMode: true,
        ssr: false,
        basename: "/",
        routeDiscovery: { mode: "initial", manifestPath: "/__manifest" }
      };
      await import("${entryScript}");
    </script>
  </body>
</html>`;
}

/** Serve a static file or return null */
async function serveStatic(pathname) {
  // Prevent path traversal
  const safePath = join(CLIENT_DIR, decodeURIComponent(pathname));
  if (!safePath.startsWith(CLIENT_DIR)) return null;

  try {
    const info = await stat(safePath);
    if (!info.isFile()) return null;
    const data = await readFile(safePath);
    const ext = extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const headers = { "Content-Type": contentType };

    // Cache hashed assets (fingerprinted filenames) aggressively
    if (pathname.startsWith("/assets/")) {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }

    return { data, headers, status: 200 };
  } catch {
    return null;
  }
}

async function main() {
  const indexHtml = await buildIndexHtml();
  const indexBuffer = Buffer.from(indexHtml, "utf-8");

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Only handle GET/HEAD
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }

    // Try serving a static file first
    const staticResult = await serveStatic(pathname);
    if (staticResult) {
      res.writeHead(staticResult.status, staticResult.headers);
      res.end(req.method === "HEAD" ? undefined : staticResult.data);
      return;
    }

    // SPA fallback — serve index.html for all other routes
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(req.method === "HEAD" ? undefined : indexBuffer);
  });

  server.listen(PORT, () => {
    console.log(`SPA static server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
