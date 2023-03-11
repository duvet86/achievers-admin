import type { LinksFunction, MetaFunction } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useNavigation,
} from "@remix-run/react";

import tailwindStylesheetUrl from "~/styles/tailwind.css";

import LoadingSpinner from "~/components/LoadingSpinner";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Achievers WA",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const transition = useNavigation();
  const isLoading =
    transition.state === "loading" || transition.state === "submitting";

  return (
    <html lang="en" className="h-full" data-theme="bumblebee">
      <head>
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

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}
