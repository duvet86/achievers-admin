import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUsersAtChapterByIdAsync(chapterId: Chapter["id"]) {
  return await prisma.userAtChapter.findMany({
    where: {
      chapterId,
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
