import { PrismaClient } from "@prisma/client";

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
