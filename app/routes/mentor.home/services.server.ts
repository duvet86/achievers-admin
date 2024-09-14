import { prisma } from "~/db.server";

export async function getNextSessionAsync(userId: number) {
  const nextAvailableSession = await prisma.mentorToStudentSession.findFirst({
    where: {
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

  return nextAvailableSession;
}

export async function getSessionsAsync(userId: number, chapterId: number) {
  return prisma.mentorToStudentSession.findMany({
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
    where: {
      chapterId,
      userId,
      attendedOn: {
        lte: new Date(),
      },
      isCancelled: false,
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
