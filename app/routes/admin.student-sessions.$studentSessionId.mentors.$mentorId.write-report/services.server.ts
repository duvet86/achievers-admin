import { prisma } from "~/db.server";

export type ActionType = "signoff" | "draft";

export interface SessionCommandRequest {
  actionType: ActionType;
  studentSessionId: number;
  report: string;
  reportFeedback: string;
}

export interface SessionCommand {
  actionType: ActionType;
  studentSessionId: number;
  report: string;
  reportFeedback: string;
  userAzureId: string;
}

export async function getStudentSessionIdAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      report: true,
      reportFeedback: true,
      session: {
        select: {
          id: true,
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

export async function saveReportAsync({
  actionType,
  studentSessionId,
  report,
  reportFeedback,
  userAzureId,
}: SessionCommand) {
  let completedOn: Date | null;
  let isSignedOff: boolean;
  switch (actionType) {
    case "signoff":
      completedOn = new Date();
      isSignedOff = true;
      break;
    case "draft":
    default:
      completedOn = null;
      isSignedOff = false;
      break;
  }

  return await prisma.studentSession.update({
    where: {
      id: studentSessionId,
    },
    data: {
      report,
      reportFeedback,
      signedOffOn: isSignedOff ? new Date() : null,
      signedOffByAzureId: isSignedOff ? userAzureId : null,
      completedOn,
      writteOnBehalfByAzureId: userAzureId,
    },
  });
}
