import type { UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function assignChapterToUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"],
  assignedBy: UserAtChapter["assignedBy"]
) {
  await prisma.userAtChapter.create({
    data: {
      chapterId,
      userId,
      assignedBy,
    },
  });
}

export async function getChaptersAsync() {
  return prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUserAtChaptersByIdAsync(
  userId: UserAtChapter["userId"]
) {
  return await prisma.userAtChapter.findMany({
    where: {
      userId,
    },
    select: {
      Chapter: true,
    },
  });
}
