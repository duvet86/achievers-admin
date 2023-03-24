import type { User, Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUserAtChapterByIdAsync(userId: User["id"]) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      email: true,
      chapter: true,
    },
  });
}

export async function assignChapterToUserAsync(
  userId: User["id"],
  chapterId: Chapter["id"]
) {
  await prisma.user.update({
    data: {
      chapterId,
    },
    where: {
      id: userId,
    },
  });
}
