import type { LinksFunction } from "react-router";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from "react-router";

import tailwindStylesheetUrl from "~/styles/tailwind.css?url";

import { trackException } from "~/services/.server";
import {
  Forbidden,
  LoadingSpinner,
  NotFound,
  UnexpectedError,
} from "~/components";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const transition = useNavigation();
  const isLoading = transition.state !== "idle";

  return (
    <html lang="en" className="h-full" data-theme="bumblebee">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Achievers WA</title>
        <Meta />
        <Links />
      </head>
      <body className="relative h-full">
        {isLoading && (
          <div className="absolute z-50 flex h-full w-full justify-center bg-slate-300/50 pt-60">
            <div>
              <LoadingSpinner dark large />
            </div>
          </div>
        )}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  trackException(error as Error);

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }

    if (error.status === 401) {
      return <Forbidden />;
    }
  }

  return <UnexpectedError />;
}
