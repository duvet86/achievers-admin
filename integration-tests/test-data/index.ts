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
    if (!(e as Error).message.includes("User_email_key")) {
      console.log(e);
    }
  } finally {
    await prisma.$disconnect();
  }
}
