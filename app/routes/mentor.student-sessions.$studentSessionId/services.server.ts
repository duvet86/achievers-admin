import { prisma } from "~/db.server";

export async function getStudentSessionAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
      hasReport: true,
    },
    select: {
      completedOn: true,
      report: true,
      reportFeedback: true,
      signedOffOn: true,
      isCancelled: true,
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
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });
}
