import { prisma } from "~/db.server";

export interface SessionCommandRequest {
  sessionId: number;
  reportFeedback: string;
  isSignedOff: boolean;
  userAzureId: string;
}

export async function getSessionByIdAsync(sessionId: number) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      report: true,
      signedOffOn: true,
      reportFeedback: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
    },
    data: {
      reportFeedback,
      signedOffOn: isSignedOff ? new Date() : null,
      signedOffByAzureId: isSignedOff ? userAzureId : null,
    },
  });
}
