import type { StudentAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getChapterByIdAsync(
  studentId: StudentAtChapter["studentId"],
  chapterId: StudentAtChapter["chapterId"],
) {
  return prisma.studentAtChapter.findUniqueOrThrow({
    where: {
      chapterId_studentId: {
        chapterId,
        studentId,
      },
    },
    select: {
      chapter: {
        select: {
          name: true,
        },
      },
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function removeChapterFromStudentAsync(
  studentId: StudentAtChapter["studentId"],
  chapterId: StudentAtChapter["chapterId"],
) {
  await prisma.studentAtChapter.delete({
    where: {
      chapterId_studentId: {
        chapterId,
        studentId,
      },
    },
  });
}
