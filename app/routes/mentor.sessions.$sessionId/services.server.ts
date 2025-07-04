import { prisma } from "~/db.server";

export async function getSessionAsync(sessionId: number) {
  return await prisma.session.findUnique({
    where: {
      id: sessionId,
      hasReport: true,
    },
    select: {
      attendedOn: true,
      completedOn: true,
      report: true,
      reportFeedback: true,
      signedOffOn: true,
      isCancelled: true,
      studentSession: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      mentorSession: {
        select: {
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });
}
