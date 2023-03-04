import type { Chapter, UserAtChapter } from "@prisma/client";
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
  return await prisma.userAtChapter.findMany({
    where: {
      chapterId,
    },
  });
}

export async function getAssignedChaptersToUserAsync(
  id: AzureUserWebAppWithRole["id"],
  includeChapters = true
) {
  return prisma.userAtChapter.findMany({
    where: {
      userId: id,
    },
    include: {
      chapter: includeChapters,
    },
  });
}

export async function getAssignedChaptersForUsersLookUpAsync(
  userIds: AzureUserWebAppWithRole["id"][]
) {
  const userAtChapter = await prisma.userAtChapter.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
    include: {
      chapter: true,
    },
  });

  const assignedChaptersLookUp = userAtChapter.reduce<
    Record<
      string,
      | Array<
          UserAtChapter & {
            chapter: Chapter;
          }
        >
      | undefined
    >
  >((res, value) => {
    res[value.userId] = res[value.userId]
      ? [...res[value.userId]!, value]
      : [value];

    return res;
  }, {});

  return assignedChaptersLookUp;
}
