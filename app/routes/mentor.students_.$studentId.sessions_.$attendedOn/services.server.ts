import { prisma } from "~/db.server";

export type ActionType = "completed" | "remove-complete" | "draft";

interface SessionQuery {
  attendedOn: string;
  chapterId: number;
  studentId: number;
  userId: number;
}

export async function getSessionReportForStudentAsync({
  attendedOn,
  chapterId,
  studentId,
  userId,
}: SessionQuery) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      userId_studentId_chapterId_attendedOn: {
        attendedOn,
        chapterId,
        studentId,
        userId,
      },
    },
    select: {
      attendedOn: true,
      report: true,
      completedOn: true,
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
  actionType: ActionType,
  { attendedOn, chapterId, studentId, userId }: SessionQuery,
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
      userId_studentId_chapterId_attendedOn: {
        attendedOn,
        chapterId,
        studentId,
        userId,
      },
    },
    data: {
      report,
      completedOn,
    },
  });
}
