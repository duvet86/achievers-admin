import { prisma } from "~/db.server";

export async function getStudentSession(id: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      completedOn: true,
      hasReport: true,
      student: {
        select: {
          fullName: true,
        },
      },
      session: {
        select: {
          id: true,
          attendedOn: true,
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

export async function cancelStudentSession(id: number, cancelReason: string) {
  return await prisma.studentSession.update({
    where: {
      id,
    },
    data: {
      cancelledAt: new Date(),
      cancelledReason: cancelReason,
      isCancelled: true,
    },
  });
}
