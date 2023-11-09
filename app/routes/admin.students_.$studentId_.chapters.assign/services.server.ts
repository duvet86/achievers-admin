import type { Student, StudentAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStudentAtChapterByIdAsync(studentId: Student["id"]) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id: studentId,
    },
    select: {
      firstName: true,
      lastName: true,
      studentAtChapter: {
        select: {
          chapter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function assignChapterToStudentAsync(
  studentId: StudentAtChapter["studentId"],
  chapterId: StudentAtChapter["chapterId"],
  azureADId: string,
) {
  await prisma.studentAtChapter.create({
    data: {
      studentId,
      chapterId,
      assignedBy: azureADId,
    },
  });
}
