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
