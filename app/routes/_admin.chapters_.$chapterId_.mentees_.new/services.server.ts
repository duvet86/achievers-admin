import type { Chapter, Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createNewMentee(
  newMentee: Prisma.XOR<
    Prisma.MenteeCreateInput,
    Prisma.MenteeUncheckedCreateInput
  >
) {
  return await prisma.mentee.create({
    data: newMentee,
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
