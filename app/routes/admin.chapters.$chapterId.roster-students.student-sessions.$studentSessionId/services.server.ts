import type { $Enums } from "~/prisma/client";

import { prisma } from "~/db.server";

export interface SessionCommandCreate {
  studentSessionId: number;
  mentorId: number;
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

export async function getStudentSessionByIdAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      status: true,
      reason: true,
      student: {
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
          mentorSession: {
            select: {
              id: true,
              mentor: {
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

export async function getMentorsForStudentAsync(
  chapterId: number,
  studentId: number,
  attendedOn: Date,
) {
  const allMentors = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
    SELECT id, fullName
    FROM User
    WHERE chapterId = ${chapterId} AND endDate IS NULL
      AND id NOT IN (SELECT userId FROM MentorToStudentAssignement WHERE studentId = ${studentId})
    ORDER BY fullName ASC`;

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

  const unavailableMentors = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      attendedOn,
      status: "UNAVAILABLE",
    },
    select: {
      mentorId: true,
    },
  });

  const unavailableMentorsLookup = unavailableMentors.reduce<
    Record<string, boolean>
  >((res, { mentorId }) => {
    res[mentorId.toString()] = true;

    return res;
  }, {});

  return assignedMentors
    .map(({ user: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allMentors)
    .map(({ id, fullName }) => {
      const isUnavailable = unavailableMentorsLookup[id] ?? false;

      return {
        label: fullName + (isUnavailable ? " (Unavailable)" : ""),
        value: id.toString(),
        isDisabled: isUnavailable,
      };
    });
}

export async function restoreAvailabilityAsync(
  studentSessionId: number,
  status: string,
) {
  const sessionCount = await prisma.sessionAttendance.count({
    where: {
      studentSessionId,
    },
  });

  if (sessionCount > 0) {
    return await prisma.studentSession.update({
      where: {
        id: studentSessionId,
      },
      data: {
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
        studentId: true,
        attendedOn: true,
      },
    });
  }

  return await prisma.studentSession.delete({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      studentId: true,
      attendedOn: true,
    },
  });
}

export async function addMentorToSessionAsync({
  studentSessionId,
  mentorId,
}: SessionCommandCreate) {
  return await prisma.$transaction(async (tx) => {
    const studentSession = await tx.studentSession.findUniqueOrThrow({
      where: {
        id: studentSessionId,
      },
      select: {
        id: true,
        chapterId: true,
        attendedOn: true,
      },
    });

    let mentorSession = await tx.mentorSession.findUnique({
      where: {
        chapterId_mentorId_attendedOn: {
          chapterId: studentSession.chapterId,
          attendedOn: studentSession.attendedOn,
          mentorId,
        },
      },
      select: {
        id: true,
      },
    });

    mentorSession ??= await tx.mentorSession.create({
      data: {
        chapterId: studentSession.chapterId,
        attendedOn: studentSession.attendedOn,
        mentorId,
      },
      select: {
        id: true,
      },
    });

    return await tx.sessionAttendance.create({
      data: {
        chapterId: studentSession.chapterId,
        attendedOn: studentSession.attendedOn,
        mentorSessionId: mentorSession.id,
        studentSessionId: studentSession.id,
      },
    });
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
      studentSession: {
        select: {
          studentId: true,
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
