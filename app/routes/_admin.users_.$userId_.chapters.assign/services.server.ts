import type { User, UserAtChapter } from "@prisma/client";

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
      userAtChapter: {
        select: {
          chapter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function assignChapterToUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"],
  azureADId: string
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      email: true,
    },
  });

  await prisma.userAtChapter.create({
    data: {
      userId,
      chapterId,
      assignedBy: user.email,
    },
  });
}
