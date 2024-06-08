import { prisma } from "~/db.server";

export type ActionType = "completed" | "remove-complete" | "draft";

export interface SessionCommandRequest {
  type: ActionType;
  sessionId: number;
  report: string;
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
      completedOn: true,
      signedOffOn: true,
      reportFeedback: true,
      student: {
        select: {
          id: true,
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
) {
  let completedOn: Date | null;
  switch (actionType) {
    case "completed":
      completedOn = new Date();
      break;
    case "draft":
    case "remove-complete":
    default:
      completedOn = null;
      break;
  }

  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
    },
    data: {
      report,
      completedOn,
    },
  });
}
