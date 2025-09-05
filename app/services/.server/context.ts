import type { unstable_MiddlewareFunction } from "react-router";

import { unstable_createContext } from "react-router";

export const cloneRequestContext = unstable_createContext<Request | null>(null);

// Server-side Middleware
const cloneRequestMiddleware: unstable_MiddlewareFunction = async (
  { request, context },
  next,
) => {
  if (request.method.toUpperCase() !== "GET") {
    context.set(cloneRequestContext, request.clone());
  }

  await next();
};

export const middleware: unstable_MiddlewareFunction[] = [
  cloneRequestMiddleware,
];
