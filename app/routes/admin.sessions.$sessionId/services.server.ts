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
      chapterId: true,
      chapter: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

export async function getMentorsForStudent(
  chapterId: number,
  studentId: number,
) {
  const allMentors = await prisma.user.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: {
        none: {
          studentId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const assignedMentors = await prisma.mentorToStudentAssignement.findMany({
    where: {
      studentId,
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      user: {
        fullName: "asc",
      },
    },
  });

  return assignedMentors
    .map(({ user: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allMentors);
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
