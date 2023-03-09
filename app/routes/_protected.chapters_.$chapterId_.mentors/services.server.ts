import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUsersAtChapterByIdAsync(chapterId: Chapter["id"]) {
  return await prisma.userAtChapter.findMany({
    where: {
      chapterId,
    },
  });
}
