import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { renderToReadableStream } from "react-dom/server.browser";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);

  const stream = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
        responseStatusCode = 500;
      },
    }
  );

  // In SPA mode, wait for the full document
  if (routerContext.isSpaMode) {
    await stream.allReady;
  }

  clearTimeout(timeoutId);
  responseHeaders.set("Content-Type", "text/html");

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
