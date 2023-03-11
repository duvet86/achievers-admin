import type { Chapter, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getAssignedChaptersToUsersLookUpAsync(
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
    Record<string, Chapter[]>
  >((res, userAtChapter) => {
    if (res[userAtChapter.userId]) {
      res[userAtChapter.userId].push(userAtChapter.Chapter);
    } else {
      res[userAtChapter.userId] = [userAtChapter.Chapter];
    }

    return res;
  }, {});

  return assignedChaptersLookUp;
}
