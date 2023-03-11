import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesAtChapterByIdAsync(chapterId: Chapter["id"]) {
  return await prisma.mentee.findMany({
    where: {
      chapterId,
    },
    include: {
      Mentors: true,
    },
  });
}

export async function getChapterByIdAsync(id: Chapter["id"]) {
  return prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      name: true,
    },
  });
}
