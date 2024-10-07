import { prisma } from "~/db.server";

export async function getNextSessionAsync(userId: number, chapterId: number) {
  return await prisma.mentorToStudentSession.findFirst({
    where: {
      chapterId,
      userId,
      attendedOn: {
        gt: new Date(),
      },
      isCancelled: false,
    },
    select: {
      attendedOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

export async function getSessionsAsync(userId: number, chapterId: number) {
  return prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      userId,
      attendedOn: {
        lte: new Date(),
      },
      isCancelled: false,
    },
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      attendedOn: "desc",
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
