import type { Chapter, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getAssignedChapterToUsersLookUpAsync(
  userIds: User["id"][]
) {
  const userAtChapters = await prisma.userAtChapter.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
    include: {
      Chapter: true,
    },
  });

  const assignedChaptersLookUp = userAtChapters.reduce<
    Record<string, Chapter | null>
  >((res, userAtChapter) => {
    res[userAtChapter.userId] = userAtChapter.Chapter;

    return res;
  }, {});

  return assignedChaptersLookUp;
}
