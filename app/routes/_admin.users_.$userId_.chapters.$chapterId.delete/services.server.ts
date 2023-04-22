import type { UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getChapterByIdAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"]
) {
  return prisma.userAtChapter.findUniqueOrThrow({
    where: {
      chapterId_userId: {
        chapterId,
        userId,
      },
    },
    select: {
      chapter: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function removeChapterFromUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"]
) {
  await prisma.userAtChapter.delete({
    where: {
      chapterId_userId: {
        chapterId,
        userId,
      },
    },
  });
}
