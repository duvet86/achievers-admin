import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

interface MentorSessionCommand {
  chapterId: number;
  status: string;
  mentorId: number;
  attendedOn: string;
}

interface SessionCommand {
  chapterId: number;
  studentId: number;
  mentorId: number;
  attendedOn: string;
}

export interface SessioViewModel {
  id: number;
  chapterId: number;
  attendedOn: Date;
  status: SessionStatus;
  sessionAttendance: {
    id: number;
    studentSession: { student: { id: number; fullName: string } };
    hasReport: boolean;
    completedOn: Date | null;
    signedOffOn: Date | null;
  }[];
  mentor: { id: number; fullName: string };
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
  const attendedOnConverted = dayjs.utc(attendedOn, "YYYY-MM-DD");

  const studentsInSession = await prisma.$queryRaw<{ id: number }[]>`
    SELECT
      s.id
    FROM StudentSession ss
    INNER JOIN SessionAttendance sa ON sa.StudentSessionId = ss.id
    INNER JOIN Student s ON s.id = ss.studentId
    WHERE ss.chapterId = ${chapterId}
      AND ss.attendedOn = ${attendedOnConverted}
      AND s.endDate IS NULL
    GROUP BY s.id`;

  const unavailableStudents = await prisma.studentSession.findMany({
    where: {
      chapterId,
      attendedOn: attendedOnConverted.toDate(),
      status: "UNAVAILABLE",
    },
    select: {
      student: {
        select: {
          id: true,
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
            .map(({ id }) => id)
            .concat(unavailableStudents.map(({ student }) => student.id)),
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

export async function getMentorSessionsLookupAsync(
  chapterId: number,
  mentorId: number,
  term: Term,
) {
  const myMentorSessions = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      mentorId,
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
      sessionAttendance: {
        select: {
          id: true,
          signedOffOn: true,
          completedOn: true,
          hasReport: true,
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
      },
    },
  });

  const myPartners = await prisma.$queryRaw<{ userId: number }[]>`
    SELECT
      b.userId
    FROM MentorToStudentAssignement a
    INNER JOIN MentorToStudentAssignement b ON b.studentId = a.studentId
    WHERE a.userId = ${mentorId}`;

  const myPartnersMentorSessions = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      mentorId: {
        in: myPartners
          .filter(({ userId }) => userId !== mentorId)
          .map(({ userId }) => userId),
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
      sessionAttendance: {
        select: {
          id: true,
          signedOffOn: true,
          completedOn: true,
          hasReport: true,
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
      },
    },
  });

  const myMentorSessionsLookup = myMentorSessions.reduce<SessionLookup>(
    (res, mentorSession) => {
      res[dayjs.utc(mentorSession.attendedOn).format("YYYY-MM-DD")] =
        mentorSession;

      return res;
    },
    {},
  );

  const myPartnersSessionsLookup =
    myPartnersMentorSessions.reduce<SessionLookup>((res, mentorSession) => {
      res[dayjs.utc(mentorSession.attendedOn).format("YYYY-MM-DD")] =
        mentorSession;

      return res;
    }, {});

  return {
    myMentorSessionsLookup,
    myPartnersSessionsLookup,
  };
}

export async function createMentorSession({
  chapterId,
  mentorId,
  status,
  attendedOn,
}: MentorSessionCommand) {
  const mentorSession = await prisma.mentorSession.findUnique({
    where: {
      chapterId_mentorId_attendedOn: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (mentorSession !== null) {
    throw new Error();
  }

  return await prisma.mentorSession.create({
    data: {
      chapterId,
      mentorId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: status as SessionStatus,
    },
  });
}

export async function createSessionWithStudentAsync({
  chapterId,
  mentorId,
  studentId,
  attendedOn,
}: SessionCommand) {
  let mentorSession = await prisma.mentorSession.findUnique({
    where: {
      chapterId_mentorId_attendedOn: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (mentorSession !== null && mentorSession.status !== "AVAILABLE") {
    throw new Error();
  }

  let studentSession = await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (studentSession !== null && studentSession.status !== "AVAILABLE") {
    throw new Error();
  }

  return await prisma.$transaction(async (tx) => {
    mentorSession ??= await tx.mentorSession.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    studentSession ??= await tx.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    return await tx.sessionAttendance.create({
      data: {
        chapterId,
        mentorSessionId: mentorSession.id,
        studentSessionId: studentSession.id,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    });
  });
}

export async function takeSessionFromParterAsync(
  sessionId: number,
  mentorId: number,
) {
  const partnerStudentSession =
    await prisma.sessionAttendance.findUniqueOrThrow({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        chapterId: true,
        attendedOn: true,
        completedOn: true,
        studentSession: {
          select: {
            id: true,
          },
        },
      },
    });

  if (partnerStudentSession.completedOn !== null) {
    throw new Error("Report is already completed.");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.sessionAttendance.delete({
      where: {
        id: sessionId,
      },
    });

    let mentorSession = await tx.mentorSession.findUnique({
      where: {
        chapterId_mentorId_attendedOn: {
          chapterId: partnerStudentSession.chapterId,
          mentorId,
          attendedOn: partnerStudentSession.attendedOn,
        },
      },
    });

    if (mentorSession !== null) {
      return await tx.sessionAttendance.create({
        data: {
          chapterId: partnerStudentSession.chapterId,
          attendedOn: partnerStudentSession.attendedOn,
          mentorSessionId: mentorSession.id,
          studentSessionId: partnerStudentSession.studentSession.id,
        },
        select: {
          id: true,
        },
      });
    }

    mentorSession = await tx.mentorSession.create({
      data: {
        chapterId: partnerStudentSession.chapterId,
        mentorId,
        attendedOn: partnerStudentSession.attendedOn,
      },
    });

    return await tx.sessionAttendance.create({
      data: {
        chapterId: partnerStudentSession.chapterId,
        attendedOn: partnerStudentSession.attendedOn,
        mentorSessionId: mentorSession.id,
        studentSessionId: partnerStudentSession.studentSession.id,
      },
      select: {
        id: true,
      },
    });
  });
}

export async function deleteMentorSessionByIdAsync(mentorSessionId: number) {
  return await prisma.mentorSession.delete({
    where: {
      id: mentorSessionId,
    },
  });
}

export async function deleteSessionByIdAsync(sessionId: number) {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.sessionAttendance.findUniqueOrThrow({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        chapterId: true,
        attendedOn: true,
        mentorSessionId: true,
        studentSessionId: true,
      },
    });

    await tx.sessionAttendance.delete({
      where: {
        id: session.id,
      },
    });

    await tx.mentorSession.delete({
      where: {
        id: session.mentorSessionId,
      },
    });

    const sessionsForStudentCount = await tx.sessionAttendance.count({
      where: {
        chapterId: session.chapterId,
        attendedOn: session.attendedOn,
        studentSessionId: session.studentSessionId,
      },
    });

    if (sessionsForStudentCount === 1) {
      await tx.studentSession.delete({
        where: {
          id: session.studentSessionId,
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
