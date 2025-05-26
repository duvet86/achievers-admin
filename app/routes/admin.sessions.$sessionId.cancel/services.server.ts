import { prisma } from "~/db.server";

export async function getSession(sessionId: number) {
  return await prisma.sessionAttendance.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      hasReport: true,
      isCancelled: true,
      cancelledReason: true,
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

export async function cancelSession(sessionId: number, cancelReason: string) {
  return await prisma.sessionAttendance.update({
    where: {
      id: sessionId,
    },
    data: {
      cancelledAt: new Date(),
      cancelledReason: cancelReason,
    },
  });
}
