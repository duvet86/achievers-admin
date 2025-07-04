import type { $Enums } from "~/prisma/client";

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
      session: {
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

export async function restoreAvailabilityAsync(
  mentorSessionId: number,
  status: string,
) {
  const sessionCount = await prisma.session.count({
    where: {
      mentorSessionId,
    },
  });

  if (sessionCount > 0) {
    return await prisma.mentorSession.update({
      where: {
        id: mentorSessionId,
      },
      data: {
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
        mentorId: true,
        attendedOn: true,
      },
    });
  }

  return await prisma.mentorSession.delete({
    where: {
      id: mentorSessionId,
    },
    select: {
      id: true,
      mentorId: true,
      attendedOn: true,
    },
  });
}

export async function removeSessionAsync(sessionId: number) {
  const session = await prisma.session.findUniqueOrThrow({
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
    await tx.session.delete({
      where: {
        id: session.id,
      },
    });

    const sessionsForMentorCount = await tx.session.count({
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

    const sessionsForStudentCount = await tx.session.count({
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
  attendedOn: Date,
) {
  const allStudents = await prisma.$queryRaw<
    { id: number; fullName: string }[]
  >`
    SELECT id, fullName
    FROM Student
    WHERE chapterId = ${chapterId} AND endDate IS NULL
      AND id NOT IN (SELECT studentId FROM MentorToStudentAssignement WHERE userId = ${mentorId})
    ORDER BY fullName ASC`;

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
      student: {
        fullName: "asc",
      },
    },
  });

  const unavailableStudents = await prisma.studentSession.findMany({
    where: {
      chapterId,
      attendedOn,
      status: "UNAVAILABLE",
    },
    select: {
      studentId: true,
    },
  });

  const unavailableStudentsLookup = unavailableStudents.reduce<
    Record<string, boolean>
  >((res, { studentId }) => {
    res[studentId.toString()] = true;

    return res;
  }, {});

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents)
    .map(({ id, fullName }) => {
      const isUnavailable = unavailableStudentsLookup[id] ?? false;

      return {
        label: fullName + (isUnavailable ? " (Unavailable)" : ""),
        value: id.toString(),
        isDisabled: isUnavailable,
      };
    });
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

    return await tx.session.create({
      data: {
        chapterId: mentorSession.chapterId,
        attendedOn: mentorSession.attendedOn,
        mentorSessionId: mentorSession.id,
        studentSessionId: studentSession.id,
      },
    });
  });
}
