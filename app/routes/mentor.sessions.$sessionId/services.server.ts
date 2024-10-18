import { prisma } from "~/db.server";

export async function getSessionAsync(sessionId: number) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      attendedOn: true,
      completedOn: true,
      report: true,
      isCancelled: true,
      reportFeedback: true,
      signedOffOn: true,
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
