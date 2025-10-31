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
      signedOffByAzureId: true,
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

export async function getNextSession(studentId: number, attendedOn: Date) {
  return await prisma.session.findFirst({
    where: {
      hasReport: true,
      attendedOn: {
        gt: attendedOn,
      },
      studentSession: {
        studentId,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      attendedOn: "asc",
    },
  });
}

export async function getPreviousSession(studentId: number, attendedOn: Date) {
  return await prisma.session.findFirst({
    where: {
      hasReport: true,
      attendedOn: {
        lt: attendedOn,
      },
      studentSession: {
        studentId,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      attendedOn: "desc",
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
