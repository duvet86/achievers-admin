import { prisma } from "~/db.server";

export async function getSessionByIdAsync(sessionId: number) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      signedOffOn: true,
      hasReport: true,
      isCancelled: true,
      completedOn: true,
      reasonCancelled: true,
      chapter: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
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

export async function getMentorsForStudent(studentId: number) {
  return await prisma.mentorToStudentAssignement.findMany({
    where: {
      studentId,
    },
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function updateSessionAsync(sessionId: number, mentorId: number) {
  return await prisma.mentorToStudentSession.update({
    data: {
      userId: mentorId,
    },
    where: {
      id: sessionId,
    },
  });
}
