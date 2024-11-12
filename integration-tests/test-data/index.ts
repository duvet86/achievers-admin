import { PrismaClient } from "@prisma/client";

import { createUsersAsync } from "./users";
import { createStudentsAsync } from "./students";
import { assignMentorsToStudentsAsync } from "./mentor-to-sudent-assignement";
import { mentorAsync } from "./mentor";

export const CHAPTER_DATA: Record<string, string> = {
  Girrawheen: "1",
  Armadale: "2",
  Butler: "3",
};

export async function seedDataAsync(isMentor = false) {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await createUsersAsync(prisma, process.env.TEST_MENTOR_AZURE_ID!);
    await createStudentsAsync(prisma);

    await assignMentorsToStudentsAsync(prisma);

    if (isMentor) {
      await mentorAsync(prisma);
    }
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
