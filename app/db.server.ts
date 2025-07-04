import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import invariant from "tiny-invariant";

import { PrismaClient } from "~/prisma/client";

declare global {
  var __db__: PrismaClient;
}

invariant(process.env.DATABASE_HOST, "DATABASE_HOST must be set");
invariant(process.env.DATABASE_NAME, "DATABASE_NAME must be set");
invariant(process.env.DATABASE_USER, "DATABASE_USER must be set");
invariant(process.env.DATABASE_PASSWORD, "DATABASE_PASSWORD must be set");

let prisma: PrismaClient;

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  const cert = readFileSync(
    resolve(process.cwd(), "prisma/DigiCertGlobalRootCA.crt.pem"),
    "utf8",
  );

  writeFileSync("/tmp/DigiCertGlobalRootCA.crt.pem", Buffer.from(cert, "utf8"));

  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: 3306,
    connectionLimit: 5,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: {
      rejectUnauthorized: true,
      ca: readFileSync(resolve("/tmp/DigiCertGlobalRootCA.crt.pem"), "utf8"),
    },
  });

  prisma = new PrismaClient({
    adapter,
  });
} else {
  if (!global.__db__) {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: 3306,
      connectionLimit: 5,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    });

    global.__db__ = new PrismaClient({ adapter });
  }
  prisma = global.__db__;
  void prisma.$connect();
}

export { prisma };
