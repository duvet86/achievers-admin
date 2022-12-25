import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import invariant from "tiny-invariant";

invariant(process.env.DATABASE_URL2, "DATABASE_URL2 must be set");

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  writeFileSync(
    "/tmp/DigiCertGlobalRootCA.crt.pem",
    Buffer.from(process.env.CERT!, "base64")
  );

  prisma = new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL2 +
          "sslcert=/tmp/DigiCertGlobalRootCA.crt.pem",
      },
    },
  });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  prisma.$connect();
}

export { prisma };
