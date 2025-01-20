import { prisma } from "~/db.server";

export async function getStudentSessionByIdAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      signedOffOn: true,
      hasReport: true,
      completedOn: true,
      isCancelled: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          id: true,
          attendedOn: true,
          chapter: {
            select: {
              id: true,
              name: true,
            },
          },
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
