import { prisma } from "~/db.server";

export async function getSessionAsync(sessionId: number) {
  return await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
      hasReport: true,
    },
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      report: true,
      reportFeedback: true,
      signedOffOn: true,
      isCancelled: true,
      cancelledReasonId: true,
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

export async function getCancelReasons() {
  return await prisma.sessionCancelledReason.findMany({
    select: {
      id: true,
      reason: true,
    },
  });
}
