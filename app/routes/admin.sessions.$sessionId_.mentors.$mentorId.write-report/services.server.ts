import { prisma } from "~/db.server";

export type ActionType = "signoff" | "draft";

export interface SessionCommandRequest {
  type: ActionType;
  sessionId: number;
  report: string;
  reportFeedback: string;
}

export async function getSessionAsync(sessionId: number) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      report: true,
      reportFeedback: true,
      user: {
        select: {
          fullName: true,
        },
      },
    },
  });
}

export async function saveReportAsync(
  actionType: ActionType,
  sessionId: number,
  report: string,
  reportFeedback: string,
  userAzureId: string,
) {
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

  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
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
