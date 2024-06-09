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
