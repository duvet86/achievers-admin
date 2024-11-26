import { prisma } from "~/db.server";

export async function getChapterAsync(chapterId: number) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id: chapterId,
    },
    select: {
      name: true,
    },
  });
}
