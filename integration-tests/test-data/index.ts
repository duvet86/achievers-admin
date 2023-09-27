import { PrismaClient } from "@prisma/client";

import { createUsersAsync } from "./users";
import { createStudentsAsync } from "./students";

export async function seedDataAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await createUsersAsync(prisma);
    await createStudentsAsync(prisma);
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
