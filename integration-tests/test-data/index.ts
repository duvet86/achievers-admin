import { PrismaClient } from "@prisma/client";

import { createUsersAsync } from "./users";
import { createStudentsAsync } from "./students";
import { assignMentorsToStudentsAsync } from "./mentor-to-sudent-assignement";

export const CHAPTER_DATA: Record<string, string> = {
  Girrawheen: "1",
  Armadale: "2",
  Butler: "3",
};

const MENTOR_AZURE_ID = process.env.CI
  ? "ae59f3fc-5f22-4863-b60e-9654659d41b4"
  : "6089c9c7-6f2b-4298-865d-54bc1e42cb0e";

export async function seedDataAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await createUsersAsync(prisma, MENTOR_AZURE_ID);
    await createStudentsAsync(prisma);

    await assignMentorsToStudentsAsync(prisma);
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
