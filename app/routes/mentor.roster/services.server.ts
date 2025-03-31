import type { SessionStatus } from "@prisma/client/index.js";
import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

export interface SessionCommand {
  chapterId: number;
  studentId: number | null;
  mentorId: number;
  attendedOn: string;
  status: string;
}

export interface SessioViewModel {
  id: number;
  chapterId: number;
  attendedOn: Date;
  status: string;
  mentor: {
    id: number;
    fullName: string;
  };
  studentSession: {
    id: number;
    hasReport: boolean;
    completedOn: Date | null;
    signedOffOn: Date | null;
    student: {
      id: number;
      fullName: string;
    };
  }[];
}

export interface StudentSessioViewModel {
  id: number;
  hasReport: boolean;
  completedOn: Date | null;
  signedOffOn: Date | null;
  student: {
    id: number;
    fullName: string;
  };
  session: {
    id: number;
    chapterId: number;
    attendedOn: Date;
    mentor: {
      id: number;
      fullName: string;
    };
  };
}

export type SessionLookup = Record<string, SessioViewModel | undefined>;

export interface SessionCommandRequest {
  action: "create" | "update" | "remove";
  sessionId: string | undefined;
  chapterId: number;
  studentId: number;
  userId: number;
  attendedOn: string;
}

export async function getAvailableStudentsForSessionAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  const studentsInSession = await prisma.session.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
    },
    select: {
      studentSession: {
        select: {
          studentId: true,
        },
      },
    },
  });

  const availableStudentsForSession =
    await prisma.mentorToStudentAssignement.findMany({
      where: {
        userId: mentorId,
        studentId: {
          notIn: studentsInSession
            .flatMap((session) => session.studentSession)
            .map(({ studentId }) => studentId),
        },
        student: {
          endDate: null,
        },
      },
      select: {
        student: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

  return [
    {
      label: "Select a student",
      value: "",
    },
  ].concat(
    availableStudentsForSession.map(({ student }) => ({
      label: student.fullName,
      value: student.id.toString(),
    })),
  );
}

export async function getSessionsLookupAsync(
  chapterId: number,
  mentorId: number,
  term: Term,
) {
  const myPartners = await prisma.$queryRaw<{ userId: number }[]>`
    SELECT
      b.userId
    FROM achievers.MentorToStudentAssignement a
    INNER JOIN achievers.MentorToStudentAssignement b ON b.studentId = a.studentId
    WHERE a.userId = ${mentorId}`;

  const sessions = await prisma.session.findMany({
    where: {
      chapterId,
      mentorId: {
        in: myPartners.map(({ userId }) => userId),
      },
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
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
      studentSession: {
        select: {
          id: true,
          signedOffOn: true,
          completedOn: true,
          hasReport: true,
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

  const sessionLookup = sessions.reduce<SessionLookup>((res, session) => {
    res[dayjs.utc(session.attendedOn).format("YYYY-MM-DD")] = session;

    return res;
  }, {});

  return sessionLookup;
}

export async function createSessionAsync({
  chapterId,
  mentorId,
  studentId,
  attendedOn,
  status,
}: SessionCommand) {
  if (studentId === null) {
    return await prisma.session.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
        status: status as SessionStatus,
      },
      select: {
        id: true,
      },
    });
  }

  return await prisma.session.create({
    data: {
      chapterId,
      mentorId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: status as SessionStatus,
      studentSession: {
        create: {
          studentId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function takeSessionFromParterAsync(
  studentSessionId: number,
  mentorId: number,
) {
  await prisma.$transaction(async (tx) => {
    const partnerStudentSession = await tx.studentSession.findUniqueOrThrow({
      where: {
        id: studentSessionId,
      },
      select: {
        sessionId: true,
        completedOn: true,
        studentId: true,
        session: {
          select: {
            chapterId: true,
            attendedOn: true,
          },
        },
      },
    });

    if (partnerStudentSession.completedOn) {
      throw new Error("Reposrt already completed.");
    }

    await tx.studentSession.delete({
      where: {
        id: studentSessionId,
      },
    });

    const studentSessionCount = await tx.studentSession.count({
      where: {
        sessionId: partnerStudentSession.sessionId,
      },
    });

    if (studentSessionCount === 0) {
      await tx.session.delete({
        where: {
          id: partnerStudentSession.sessionId,
        },
      });
    }

    const newSession = await tx.session.findUnique({
      where: {
        mentorId_chapterId_attendedOn: {
          mentorId,
          attendedOn: partnerStudentSession.session.attendedOn,
          chapterId: partnerStudentSession.session.chapterId,
        },
      },
      select: {
        id: true,
      },
    });

    if (newSession !== null) {
      await tx.studentSession.create({
        data: {
          sessionId: newSession.id,
          studentId: partnerStudentSession.studentId,
        },
      });
    } else {
      await tx.session.create({
        data: {
          attendedOn: partnerStudentSession.session.attendedOn,
          chapterId: partnerStudentSession.session.chapterId,
          mentorId,
          studentSession: {
            create: {
              studentId: partnerStudentSession.studentId,
            },
          },
        },
      });
    }
  });
}

export async function removeSessionAsync(
  sessionId: number,
  studentSessionId: number | null,
) {
  await prisma.$transaction(async (tx) => {
    if (studentSessionId !== null) {
      const partnerStudentSession = await tx.studentSession.findUniqueOrThrow({
        where: {
          id: studentSessionId,
        },
        select: {
          completedOn: true,
        },
      });

      if (partnerStudentSession.completedOn) {
        throw new Error("Reposrt already completed.");
      }

      await tx.studentSession.delete({
        where: {
          id: studentSessionId,
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
  });
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}
