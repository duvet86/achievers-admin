import type { RenderToPipeableStreamOptions } from "react-dom/server";
import type {
  EntryContext,
  HandleErrorFunction,
  unstable_RouterContextProvider,
} from "react-router";
import type { CurentUserInfo } from "./services/.server";

import { PassThrough } from "node:stream";

import { renderToPipeableStream } from "react-dom/server";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isRouteErrorResponse, ServerRouter } from "react-router";
import { isbot } from "isbot";

import {
  cloneRequestContext,
  getTokenInfoAsync,
  trackException,
} from "./services/.server";
import { parseJwt } from "./services";

export const streamTimeout = 5_000;

export const handleError: HandleErrorFunction = (
  error,
  { request, context },
) => {
  // React Router may abort some interrupted requests, don't log those
  if (request.signal.aborted) {
    return;
  }

  void logError(request, context.get(cloneRequestContext), error);

  // make sure to still log the error so you can see it
  console.error(error);
};

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // loadContext: AppLoadContext,
  // If you have middleware enabled:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: unstable_RouterContextProvider,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000);
  });
}

async function logError(
  request: Request,
  postRequest: Request | null,
  error: unknown,
) {
  let loggedUser: CurentUserInfo | undefined;
  try {
    const tokenInfo = await getTokenInfoAsync(request);
    loggedUser = parseJwt<CurentUserInfo>(tokenInfo.idToken);
  } catch {
    /* empty */
  }

  const body = postRequest ? await postRequest.text() : undefined;

  if (isRouteErrorResponse(error)) {
    trackException(new Error(`HTTP ${error.status}: ${error.statusText}`), {
      url: request.url,
      method: request.method,
      errorData: JSON.stringify(error.data),
      body,
      azureId: loggedUser?.oid,
    });
  } else if (error instanceof Error) {
    trackException(error, {
      url: request.url,
      method: request.method,
      body,
      azureId: loggedUser?.oid,
    });
  } else {
    trackException(new Error(JSON.stringify(error)), {
      url: request.url,
      method: request.method,
      body,
      azureId: loggedUser?.oid,
    });
  }
}
