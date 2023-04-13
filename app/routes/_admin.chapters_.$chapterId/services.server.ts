import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getChapterByIdAsync(id: Chapter["id"]) {
  return prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      name: true,
      address: true,
    },
  });
}
