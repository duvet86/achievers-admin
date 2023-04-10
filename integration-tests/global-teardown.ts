import { PrismaClient } from "@prisma/client";

async function globalTeardown() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  await prisma.session.deleteMany();
}

export default globalTeardown;
