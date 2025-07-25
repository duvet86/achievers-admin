import { prisma } from "~/db.server";

export interface SessionCommandRequest {
  reportFeedback: string;
  isSignedOff: boolean;
}

export async function getSessionByIdAsync(sessionId: number) {
  return await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      report: true,
      signedOffOn: true,
      reportFeedback: true,
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
    },
  });
}

export async function saveReportAsync(
  sessionId: number,
  reportFeedback: string,
  isSignedOff: boolean,
  userAzureId: string,
) {
  return await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      reportFeedback,
      signedOffOn: isSignedOff ? new Date() : null,
      signedOffByAzureId: isSignedOff ? userAzureId : null,
    },
    select: {
      id: true,
      attendedOn: true,
      mentorSession: {
        select: {
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
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
    },
  });
}
