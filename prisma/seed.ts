/*eslint-env node*/
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { PrismaClient } from "./client/client";

invariant(process.env.DATABASE_HOST, "DATABASE_HOST must be set");
invariant(process.env.DATABASE_NAME, "DATABASE_NAME must be set");
invariant(process.env.DATABASE_USER, "DATABASE_USER must be set");
invariant(process.env.DATABASE_PASSWORD, "DATABASE_PASSWORD must be set");

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: 3306,
  connectionLimit: 5,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl:
    process.env.NODE_ENV === "production" || process.env.ENABLE_SSL
      ? {
          rejectUnauthorized: true,
          ca: readFileSync(
            resolve(process.cwd(), "prisma/DigiCertGlobalRootCA.crt.pem"),
            "utf8",
          ),
        }
      : undefined,
});

const prisma = new PrismaClient({ adapter });

async function seed() {
  await prisma.chapter.upsert({
    where: {
      name: "Girrawheen",
    },
    create: {
      name: "Girrawheen",
      address: "11 Patrick Court Girrawheen WA 6064",
    },
    update: {},
  });

  await prisma.chapter.upsert({
    where: {
      name: "Armadale",
    },
    create: {
      name: "Armadale",
      address:
        "Library, Westfield Park Primary School, Hemingway Drive Camillo WA 6111",
    },
    update: {},
  });

  await prisma.chapter.upsert({
    where: {
      name: "Butler",
    },
    create: {
      name: "Butler",
      address: "East Butler Primary School, Amersham Crescent Butler 6036",
    },
    update: {},
  });

  // ------------ Session cancel reasons
  await prisma.sessionCancelledReason.upsert({
    where: {
      reason: "Absent WITH notice",
    },
    create: {
      reason: "Absent WITH notice",
    },
    update: {},
  });

  await prisma.sessionCancelledReason.upsert({
    where: {
      reason: "Absent WITHOUT notice",
    },
    create: {
      reason: "Absent WITHOUT notice",
    },
    update: {},
  });

  // 2024 --------------------------

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-01-31T00:00:00.000Z").toDate(),
        endDate: dayjs("2024-03-28T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-01-31T00:00:00.000Z").toDate(),
      endDate: dayjs("2024-03-28T00:00:00.000Z").toDate(),
      label: "Term 1",
    },
    update: {
      label: "Term 1",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-04-15T00:00:00.000Z").toDate(),
        endDate: dayjs("2024-06-28T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-04-15T00:00:00.000Z").toDate(),
      endDate: dayjs("2024-06-28T00:00:00.000Z").toDate(),
      label: "Term 2",
    },
    update: {
      label: "Term 2",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-07-15T00:00:00.000Z").toDate(),
        endDate: dayjs("2024-09-20T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-07-15T00:00:00.000Z").toDate(),
      endDate: dayjs("2024-09-20T00:00:00.000Z").toDate(),
      label: "Term 3",
    },
    update: {
      label: "Term 3",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-10-07T00:00:00.000Z").toDate(),
        endDate: dayjs("2024-12-12T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-10-07T00:00:00.000Z").toDate(),
      endDate: dayjs("2024-12-12T00:00:00.000Z").toDate(),
      label: "Term 4",
    },
    update: {
      label: "Term 4",
    },
  });

  // 2025 --------------------------

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-02-05T00:00:00.000Z").toDate(),
        endDate: dayjs("2025-04-11T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-02-05T00:00:00.000Z").toDate(),
      endDate: dayjs("2025-04-11T00:00:00.000Z").toDate(),
      label: "Term 1",
    },
    update: {
      label: "Term 1",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-04-28T00:00:00.000Z").toDate(),
        endDate: dayjs("2025-07-04T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-04-28T00:00:00.000Z").toDate(),
      endDate: dayjs("2025-07-04T00:00:00.000Z").toDate(),
      label: "Term 2",
    },
    update: {
      label: "Term 2",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-07-21T00:00:00.000Z").toDate(),
        endDate: dayjs("2025-09-26T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-07-21T00:00:00.000Z").toDate(),
      endDate: dayjs("2025-09-26T00:00:00.000Z").toDate(),
      label: "Term 3",
    },
    update: {
      label: "Term 3",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-10-13T00:00:00.000Z").toDate(),
        endDate: dayjs("2025-12-18T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-10-13T00:00:00.000Z").toDate(),
      endDate: dayjs("2025-12-18T00:00:00.000Z").toDate(),
      label: "Term 4",
    },
    update: {
      label: "Term 4",
    },
  });

  // 2026 --------------------------

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2026-02-05T00:00:00.000Z").toDate(),
        endDate: dayjs("2026-04-02T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2026,
      startDate: dayjs("2026-02-05T00:00:00.000Z").toDate(),
      endDate: dayjs("2026-04-02T00:00:00.000Z").toDate(),
      label: "Term 1",
    },
    update: {
      label: "Term 1",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2026-04-20T00:00:00.000Z").toDate(),
        endDate: dayjs("2026-07-03T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2026,
      startDate: dayjs("2026-04-20T00:00:00.000Z").toDate(),
      endDate: dayjs("2026-07-03T00:00:00.000Z").toDate(),
      label: "Term 2",
    },
    update: {
      label: "Term 2",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2026-07-20T00:00:00.000Z").toDate(),
        endDate: dayjs("2026-09-25T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2026,
      startDate: dayjs("2026-07-20T00:00:00.000Z").toDate(),
      endDate: dayjs("2026-09-25T00:00:00.000Z").toDate(),
      label: "Term 3",
    },
    update: {
      label: "Term 3",
    },
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2026-10-12T00:00:00.000Z").toDate(),
        endDate: dayjs("2026-12-17T00:00:00.000Z").toDate(),
      },
    },
    create: {
      year: 2026,
      startDate: dayjs("2026-10-12T00:00:00.000Z").toDate(),
      endDate: dayjs("2026-12-17T00:00:00.000Z").toDate(),
      label: "Term 4",
    },
    update: {
      label: "Term 4",
    },
  });

  console.info(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
