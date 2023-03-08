import type { UserAtChapter } from "@prisma/client";

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
