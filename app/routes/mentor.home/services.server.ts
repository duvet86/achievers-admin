import { prisma } from "~/db.server";

export async function getNextStudentSessionAsync(
  mentorId: number,
  chapterId: number,
) {
  return await prisma.studentSession.findFirst({
    where: {
      session: {
        chapterId,
        mentorId,
        attendedOn: {
          gt: new Date(),
        },
      },
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
        },
      },
    },
  });
}

export async function getStudentSessionsAsync(
  mentorId: number,
  chapterId: number,
) {
  return prisma.studentSession.findMany({
    where: {
      session: {
        chapterId,
        mentorId,
        attendedOn: {
          lte: new Date(),
        },
      },
    },
    select: {
      id: true,
      completedOn: true,
      signedOffOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
        },
      },
    },
    orderBy: {
      session: {
        attendedOn: "desc",
      },
    },
    take: 5,
  });
}

export async function hasAnyStudentsAssignedAsync(mentorId: number) {
  return (
    (await prisma.mentorToStudentAssignement.count({
      where: {
        userId: mentorId,
      },
    })) > 0
  );
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      fullName: true,
      chapterId: true,
    },
  });
}
