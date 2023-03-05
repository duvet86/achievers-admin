import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesInChapterAsync(chapterId: Chapter["id"]) {
  return await prisma.mentee.findMany({
    where: {
      chapterId: chapterId,
    },
  });
}
