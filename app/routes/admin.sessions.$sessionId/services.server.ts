import { prisma } from "~/db.server";

export async function getSessionByIdAsync(sessionId: number) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      signedOffOn: true,
      hasReport: true,
      isCancelled: true,
      completedOn: true,
      reasonCancelled: true,
      chapterId: true,
      chapter: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}
