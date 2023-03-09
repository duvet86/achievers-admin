import type { UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUserAtChapterByIdAsync(
  chapterId: UserAtChapter["chapterId"],
  userId: UserAtChapter["userId"]
) {
  return await prisma.userAtChapter.findUnique({
    where: {
      userId_chapterId: {
        chapterId,
        userId,
      },
    },
    include: {
      Chapter: true,
    },
  });
}
