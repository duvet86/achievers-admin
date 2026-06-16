import express from "express";
import { createRequestHandler } from "@react-router/express";

export const app = express();

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
  }),
);
