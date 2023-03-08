import type { UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUserAtChaptersByIdAsync(
  userId: UserAtChapter["userId"]
) {
  return await prisma.userAtChapter.findMany({
    where: {
      userId,
    },
    include: {
      Chapter: true,
    },
  });
}
