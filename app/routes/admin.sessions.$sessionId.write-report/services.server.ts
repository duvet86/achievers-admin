import { prisma } from "~/db.server";

export type ActionType = "signoff" | "draft";

export interface SessionCommandRequest {
  actionType: ActionType;
  sessionId: number;
  report: string;
  reportFeedback: string;
}

export interface SessionCommand {
  actionType: ActionType;
  sessionId: number;
  report: string;
  reportFeedback: string;
  userAzureId: string;
}

export async function getSessionIdAsync(sessionId: number) {
  return await prisma.sessionAttendance.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      report: true,
      reportFeedback: true,
      signedOffOn: true,
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

export async function saveReportAsync({
  actionType,
  sessionId,
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

  return await prisma.sessionAttendance.update({
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
