import { prisma } from "~/db.server";

export async function getSessionAsync(sessionAttendanceId: number) {
  return await prisma.sessionAttendance.findUnique({
    where: {
      id: sessionAttendanceId,
      hasReport: true,
    },
    select: {
      attendedOn: true,
      completedOn: true,
      report: true,
      reportFeedback: true,
      signedOffOn: true,
      isCancelled: true,
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
