import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommandCteate {
  sessionId: number;
  studentId: number;
}

export interface SessionCommandRemove {
  sessionId: number;
  studentId: number | null;
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

export async function getSessionByIdAsync(sessionId: number) {
  return await prisma.session.findFirstOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      mentor: {
        select: {
          id: true,
          fullName: true,
        },
      },
      studentSession: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          signedOffOn: true,
          student: {
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

export async function removeSessionAsync({
  sessionId,
  studentId,
}: SessionCommandRemove) {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUniqueOrThrow({
      where: {
        id: sessionId,
      },
      select: {
        chapterId: true,
        mentorId: true,
        attendedOn: true,
      },
    });

    if (studentId !== null) {
      await tx.studentSession.delete({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
      });
    }

    const studentSessionCount = await tx.studentSession.count({
      where: {
        sessionId,
      },
    });

    if (studentSessionCount === 0) {
      await tx.session.delete({
        where: {
          id: sessionId,
        },
      });
    }

    return session;
  });
}

export async function getStudentsForMentorAsync(
  chapterId: number,
  mentorId: number | null,
) {
  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: mentorId
        ? {
            none: {
              userId: mentorId,
            },
          }
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const assignedStudents = mentorId
    ? await prisma.mentorToStudentAssignement.findMany({
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
      })
    : [];

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents);
}

export async function getSessionsByDateAsync(
  chapterId: number,
  attendedOn: Date,
) {
  return await prisma.session.findMany({
    where: {
      chapterId,
      attendedOn,
    },
    select: {
      mentorId: true,
      studentSession: {
        select: {
          student: {
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

export async function addStudentToSessionAsync(
  sessionId: number,
  studentId: number,
) {
  return await prisma.studentSession.create({
    data: {
      studentId,
      sessionId,
    },
    select: {
      session: {
        select: {
          chapterId: true,
        },
      },
    },
  });
}
