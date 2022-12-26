import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return prisma.chapter.findMany();
}

export async function getChapterByIdAsync(id: Chapter["id"]) {
  return prisma.chapter.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });
}
