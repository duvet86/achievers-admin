import type { LinksFunction } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from "@remix-run/react";

import tailwindStylesheetUrl from "~/styles/tailwind.css";

import { LoadingSpinner } from "~/components";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export default function App() {
  const transition = useNavigation();
  const isLoading =
    transition.state === "loading" || transition.state === "submitting";

  return (
    <html lang="en" className="h-full" data-theme="bumblebee">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Achievers WA</title>
        <Meta />
        <Links />
      </head>
      <body className="relative h-full">
        {isLoading && (
          <div className="absolute z-20 flex h-full w-full justify-center bg-slate-300 bg-opacity-50 pt-60">
            <div>
              <LoadingSpinner dark large />
            </div>
          </div>
        )}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <html>
        <head>
          <title>Oops!</title>
          <Meta />
          <Links />
        </head>
        <body>
          <h1>
            {error.status} {error.statusText}
          </h1>
          <p>{error.data.message}</p>
          <Scripts />
        </body>
      </html>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  const errorCaught =
    error instanceof Error ? error : new Error("Unknown error");

  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="card bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Error</h2>
            <p>{errorCaught.message}</p>
            <p>The stack trace is:</p>
            <pre>{errorCaught.stack}</pre>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
