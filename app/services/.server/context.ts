import type { MiddlewareFunction } from "react-router";

import { createContext } from "react-router";

export const cloneRequestContext = createContext<Request | null>(null);

// Server-side Middleware
export const cloneRequestMiddleware: MiddlewareFunction = async (
  { request, context },
  next,
) => {
  if (request.method.toUpperCase() !== "GET") {
    context.set(cloneRequestContext, request.clone());
  }

  await next();
};
