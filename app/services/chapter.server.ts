import type { Chapter } from "@prisma/client";
import type { AzureUserWebAppWithRole } from "~/services/azure.server";

import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return prisma.chapter.findMany();
}

export async function getChapterByIdAsync(id: AzureUserWebAppWithRole["id"]) {
  return prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
  });
}

export async function getUsersAtChapterByIdAsync(chapterId: Chapter["id"]) {
  return await prisma.user.findMany({
    where: {
      chapterId,
    },
  });
}

export async function getAssignedChapterToUsersLookUpAsync(
  userIds: AzureUserWebAppWithRole["id"][]
) {
  const userWithChapter = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    include: {
      Chapter: true,
    },
  });

  const assignedChaptersLookUp = userWithChapter.reduce<
    Record<string, Chapter | null>
  >((res, user) => {
    res[user.id] = user.Chapter;

    return res;
  }, {});

  return assignedChaptersLookUp;
}
