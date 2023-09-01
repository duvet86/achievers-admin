import type { LinksFunction } from "@remix-run/node";

import { useContext } from "react";
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

import { NonceContext } from "~/services";
import {
  Forbidden,
  LoadingSpinner,
  NotFound,
  UnexpectedError,
} from "~/components";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export default function App() {
  const nonce = useContext(NonceContext);
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
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <html>
          <head>
            <title>Oops!</title>
            <Meta />
            <Links />
          </head>
          <body>
            <NotFound />
            <Scripts />
          </body>
        </html>
      );
    }

    if (error.status === 401) {
      return (
        <html>
          <head>
            <title>Oops!</title>
            <Meta />
            <Links />
          </head>
          <body>
            <Forbidden />
            <Scripts />
          </body>
        </html>
      );
    }
  }

  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <UnexpectedError />
        <Scripts />
      </body>
    </html>
  );
}
