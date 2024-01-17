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
        startDate: dayjs("2024-01-31"),
        endDate: dayjs("2024-03-28"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-01-31"),
      endDate: dayjs("2024-03-28"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-04-15"),
        endDate: dayjs("2024-06-28"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-04-15"),
      endDate: dayjs("2024-06-28"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-07-15"),
        endDate: dayjs("2024-09-20"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-07-15"),
      endDate: dayjs("2024-09-20"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2024-10-07"),
        endDate: dayjs("2024-12-12"),
      },
    },
    create: {
      year: 2024,
      startDate: dayjs("2024-10-07"),
      endDate: dayjs("2024-12-12"),
    },
    update: {},
  });

  // --------------------------

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-02-05"),
        endDate: dayjs("2025-04-11"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-02-05"),
      endDate: dayjs("2025-04-11"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-04-28"),
        endDate: dayjs("2025-07-04"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-04-28"),
      endDate: dayjs("2025-07-04"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-07-21"),
        endDate: dayjs("2025-09-26"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-07-21"),
      endDate: dayjs("2025-09-26"),
    },
    update: {},
  });

  await prisma.schoolTerm.upsert({
    where: {
      startDate_endDate: {
        startDate: dayjs("2025-10-13"),
        endDate: dayjs("2025-12-18"),
      },
    },
    create: {
      year: 2025,
      startDate: dayjs("2025-10-13"),
      endDate: dayjs("2025-12-18"),
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
