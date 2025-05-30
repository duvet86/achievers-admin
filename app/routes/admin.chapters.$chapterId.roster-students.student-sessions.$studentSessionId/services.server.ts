import { prisma } from "~/db.server";

export interface SessionCommandCreate {
  mentorSessionId: number;
  studentId: number;
}

export async function getChapterByIdAsync(id: number) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStudentSessionByIdAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      status: true,
      reason: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}
