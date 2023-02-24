import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const chaptersCount = await prisma.chapter.count();

  if (chaptersCount === 2) {
    return;
  }

  await prisma.chapter.create({
    data: {
      name: "Girrawheen",
      address: "11 Patrick Court Girrawheen WA 6064",
    },
  });

  await prisma.chapter.create({
    data: {
      name: "Armadale",
      address:
        "Library, Westfield Park Primary School, Hemingway Drive Camillo WA 6111",
    },
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
