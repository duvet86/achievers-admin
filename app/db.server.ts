import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import invariant from "tiny-invariant";

import { PrismaClient } from "~/prisma/client";

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  invariant(process.env.DATABASE_URL, "DATABASE_URL must be set");

  const dbUrl = process.env.DATABASE_URL;

  const cert = readFileSync(
    resolve(process.cwd(), "prisma/DigiCertGlobalRootCA.crt.pem"),
    "utf8",
  );

  writeFileSync("/tmp/DigiCertGlobalRootCA.crt.pem", Buffer.from(cert, "utf8"));

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + "?sslcert=/tmp/DigiCertGlobalRootCA.crt.pem",
      },
    },
  });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  void prisma.$connect();
}

export { prisma };
