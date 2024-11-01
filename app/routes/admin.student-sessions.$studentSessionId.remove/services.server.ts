import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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
  return await prisma.studentSession.findFirstOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      completedOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
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
        },
      },
    },
  });
}

export async function removeSessionAsync(studentSessionId: number) {
  return await prisma.$transaction(async (tx) => {
    const studentSession = await tx.studentSession.findUniqueOrThrow({
      where: {
        id: studentSessionId,
      },
      select: {
        id: true,
        completedOn: true,
        studentId: true,
        session: {
          select: {
            id: true,
            chapterId: true,
            mentorId: true,
            attendedOn: true,
          },
        },
      },
    });

    if (studentSession.completedOn !== null) {
      throw new Error();
    }

    // Delete old student session.
    await tx.studentSession.delete({
      where: {
        id: studentSessionId,
      },
    });

    const studentSessionCount = await tx.studentSession.count({
      where: {
        sessionId: studentSession.session.id,
      },
    });

    // If the old mentor is not mentoring any other students, delete the session.
    if (studentSessionCount === 0) {
      await tx.session.delete({
        where: {
          id: studentSession.session.id,
        },
      });
    }

    return studentSession;
  });
}
