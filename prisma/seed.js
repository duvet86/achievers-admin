/*eslint-env node*/

import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

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

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-01-31T00:00:00Z"),
        endDate: dayjs("2024-03-28T00:00:00Z"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-01-31T00:00:00Z"),
      endDate: dayjs("2024-03-28T00:00:00Z"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-04-15T00:00:00Z"),
        endDate: dayjs("2024-06-28T00:00:00Z"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-04-15T00:00:00Z"),
      endDate: dayjs("2024-06-28T00:00:00Z"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-07-15T00:00:00Z"),
        endDate: dayjs("2024-09-20T00:00:00Z"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-07-15T00:00:00Z"),
      endDate: dayjs("2024-09-20T00:00:00Z"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-10-07T00:00:00Z"),
        endDate: dayjs("2024-12-12T00:00:00Z"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-10-07T00:00:00Z"),
      endDate: dayjs("2024-12-12T00:00:00Z"),
    },
    update: {},
  });

  // --------------------------

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-02-05T00:00:00Z"),
        endDate: dayjs("2025-04-11T00:00:00Z"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-02-05T00:00:00Z"),
      endDate: dayjs("2025-04-11T00:00:00Z"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-04-28T00:00:00Z"),
        endDate: dayjs("2025-07-04T00:00:00Z"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-04-28T00:00:00Z"),
      endDate: dayjs("2025-07-04T00:00:00Z"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-07-21T00:00:00Z"),
        endDate: dayjs("2025-09-26T00:00:00Z"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-07-21T00:00:00Z"),
      endDate: dayjs("2025-09-26T00:00:00Z"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-10-13T00:00:00Z"),
        endDate: dayjs("2025-12-18T00:00:00Z"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-10-13T00:00:00Z"),
      endDate: dayjs("2025-12-18T00:00:00Z"),
    },
    update: {},
  });

  console.info(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
