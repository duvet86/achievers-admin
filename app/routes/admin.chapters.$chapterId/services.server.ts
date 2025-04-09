import { prisma } from "~/db.server";

export async function getChapterByIdAsync(id: number) {
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
