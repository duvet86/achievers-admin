import { prisma } from "~/db.server";

export interface SessionCommandCreate {
  mentorSessionId: number;
  studentId: number;
}

export async function getChapterByIdAsync(id: number) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getMentorSessionByIdAsync(mentorSessionId: number) {
  return await prisma.mentorSession.findUniqueOrThrow({
    where: {
      id: mentorSessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      status: true,
      mentor: {
        select: {
          id: true,
          fullName: true,
        },
      },
      sessionAttendance: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          signedOffOn: true,
          isCancelled: true,
          studentSession: {
            select: {
              id: true,
              student: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function removeMentorSessionAsync(mentorSessionId: number) {
  return await prisma.mentorSession.update({
    where: {
      id: mentorSessionId,
    },
    data: {
      status: "AVAILABLE",
    },
    select: {
      id: true,
      mentorId: true,
      attendedOn: true,
    },
  });
}

export async function removeSessionAsync(sessionId: number) {
  const session = await prisma.sessionAttendance.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      mentorSessionId: true,
      studentSessionId: true,
      isCancelled: true,
      mentorSession: {
        select: {
          mentorId: true,
        },
      },
    },
  });

  if (session.isCancelled) {
    throw new Error();
  }

  await prisma.$transaction(async (tx) => {
    await tx.sessionAttendance.delete({
      where: {
        id: session.id,
      },
    });

    const sessionsForMentorCount = await tx.sessionAttendance.count({
      where: {
        mentorSessionId: session.mentorSessionId,
      },
    });

    if (sessionsForMentorCount === 0) {
      await tx.mentorSession.delete({
        where: {
          id: session.mentorSessionId,
        },
      });
    }

    const sessionsForStudentCount = await tx.sessionAttendance.count({
      where: {
        studentSessionId: session.studentSessionId,
      },
    });

    if (sessionsForStudentCount === 0) {
      await tx.studentSession.delete({
        where: {
          id: session.studentSessionId,
        },
      });
    }
  });

  return session;
}

export async function getStudentsForMentorAsync(
  chapterId: number,
  mentorId: number,
) {
  const allStudents = await prisma.$queryRaw<
    { id: number; fullName: string }[]
  >`
    SELECT id, fullName
    FROM Student
    WHERE chapterId = ${chapterId} AND endDate IS NULL
      AND id NOT IN (SELECT studentId FROM MentorToStudentAssignement WHERE userId = ${mentorId})
    ORDER BY fullName ASC
  `;

  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentorId,
    },
    select: {
      student: {
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

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents);
}

export async function addStudentToSessionAsync({
  mentorSessionId,
  studentId,
}: SessionCommandCreate) {
  return await prisma.$transaction(async (tx) => {
    const mentorSession = await tx.mentorSession.findUniqueOrThrow({
      where: {
        id: mentorSessionId,
      },
      select: {
        id: true,
        chapterId: true,
        attendedOn: true,
      },
    });

    let studentSession = await tx.studentSession.findUnique({
      where: {
        chapterId_studentId_attendedOn: {
          chapterId: mentorSession.chapterId,
          attendedOn: mentorSession.attendedOn,
          studentId,
        },
      },
      select: {
        id: true,
      },
    });

    studentSession ??= await tx.studentSession.create({
      data: {
        chapterId: mentorSession.chapterId,
        attendedOn: mentorSession.attendedOn,
        studentId,
      },
      select: {
        id: true,
      },
    });

    return await tx.sessionAttendance.create({
      data: {
        chapterId: mentorSession.chapterId,
        attendedOn: mentorSession.attendedOn,
        mentorSessionId: mentorSession.id,
        studentSessionId: studentSession.id,
      },
    });
  });
}
