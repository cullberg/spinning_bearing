const build = await import("./build/server/index.js");
const { createRequestHandler } = await import("react-router");
const handler = createRequestHandler(build);
const request = new Request("http://localhost/spinning_bearing/", {
  headers: { "X-React-Router-SPA-Mode": "yes" }
});
const response = await handler(request);
const html = await response.text();
await Bun.write("build/client/index.html", html);
console.log(`Generated index.html (${html.length} bytes, status ${response.status})`);
