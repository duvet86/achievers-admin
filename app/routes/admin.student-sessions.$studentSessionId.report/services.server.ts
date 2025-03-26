import { prisma } from "~/db.server";

export interface SessionCommandRequest {
  reportFeedback: string;
  isSignedOff: boolean;
}

export async function getStudentSessionByIdAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      report: true,
      signedOffOn: true,
      reportFeedback: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
          mentor: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });
}

export async function saveReportAsync(
  studentSessionId: number,
  reportFeedback: string,
  isSignedOff: boolean,
  userAzureId: string,
) {
  return await prisma.studentSession.update({
    where: {
      id: studentSessionId,
    },
    data: {
      reportFeedback,
      signedOffOn: isSignedOff ? new Date() : null,
      signedOffByAzureId: isSignedOff ? userAzureId : null,
    },
  });
}
