import type { Chapter, UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function unassignChapterFromUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"]
) {
  await prisma.userAtChapter.delete({
    where: {
      userId_chapterId: {
        userId,
        chapterId,
      },
    },
  });
}

export async function getChapterByIdAsync(id: Chapter["id"]) {
  return prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      name: true,
    },
  });
}
