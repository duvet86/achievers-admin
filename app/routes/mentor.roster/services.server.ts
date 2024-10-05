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
  userId: number;
  attendedOn: string;
}

export interface SessioViewModel {
  student: {
    id: number;
    fullName: string;
  } | null;
  id: number;
  attendedOn: Date;
  completedOn: Date | null;
  signedOffOn: Date | null;
  user: {
    id: number;
    fullName: string;
  };
  isCancelled: boolean;
  hasReport: boolean;
}

export type SessionLookup = Record<string, SessioViewModel | undefined>;

export type SessionLookupStudent = Record<
  string,
  SessioViewModel[] | undefined
>;

export interface SessionCommandRequest {
  action: "create" | "update" | "remove";
  sessionId: string | undefined;
  chapterId: number;
  studentId: number;
  userId: number;
  attendedOn: string;
}

export async function getSchoolTermsForYearAsync(
  year: number,
): Promise<Term[]> {
  const terms = await prisma.schoolTerm.findMany({
    where: {
      year,
    },
    select: {
      startDate: true,
      endDate: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return terms.map<Term>(({ startDate, endDate }, index) => ({
    name: "Term " + (index + 1),
    start: dayjs(startDate),
    end: dayjs(endDate),
  }));
}

export function getCurrentTermForDate(terms: Term[], date: Date): Term {
  for (let i = 0; i < terms.length; i++) {
    if (
      dayjs(date).isBetween(terms[i].start, terms[i].end, "day", "[]") ||
      (terms[i - 1] &&
        dayjs(date).isBetween(terms[i - 1].end, terms[i].start, "day", "[]"))
    ) {
      return terms[i];
    }
  }

  return terms[0];
}

export async function getStudentsForSessionAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  const studentsInSession = await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      studentId: {
        not: null,
      },
    },
    select: {
      studentId: true,
    },
  });

  const studentsForSession = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentorId,
      studentId: {
        notIn: studentsInSession.map(({ studentId }) => studentId!),
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

  return studentsForSession.map(({ student }) => ({
    label: student.fullName,
    value: student.id.toString(),
  }));
}

export async function getSessionsLookupAsync(
  chapterId: number,
  userId: number,
  term: Term,
) {
  const mySessions = await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      userId,
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
    },
    select: {
      id: true,
      attendedOn: true,
      signedOffOn: true,
      completedOn: true,
      hasReport: true,
      isCancelled: true,
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

  const myStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId,
      student: {
        endDate: null,
      },
    },
    select: {
      studentId: true,
    },
  });

  const myStudentsSessions = await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
      studentId: {
        in: myStudents.map(({ studentId }) => studentId),
      },
      id: {
        notIn: mySessions.map(({ id }) => id),
      },
    },
    select: {
      id: true,
      attendedOn: true,
      signedOffOn: true,
      completedOn: true,
      hasReport: true,
      isCancelled: true,
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

  const mySessionsLookup = mySessions.reduce<SessionLookup>((res, session) => {
    res[dayjs.utc(session.attendedOn).format("YYYY-MM-DD")] = session;

    return res;
  }, {});

  const myStudentsSessionsLookup =
    myStudentsSessions.reduce<SessionLookupStudent>((res, session) => {
      const key = dayjs.utc(session.attendedOn).format("YYYY-MM-DD");

      if (res[key]) {
        res[key].push(session);
      } else {
        res[key] = [session];
      }

      return res;
    }, {});

  return {
    mySessionsLookup,
    myStudentsSessionsLookup,
  };
}

export async function createSessionAsync({
  userId,
  attendedOn,
  studentId,
  chapterId,
}: SessionCommand) {
  return await prisma.mentorToStudentSession.create({
    data: {
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      chapterId,
      userId,
      studentId,
    },
  });
}

export async function takeSessionFromParterAsync(
  sessionId: number,
  userId: number,
) {
  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
    },
    data: {
      userId,
    },
  });
}

export async function removeSessionAsync(sessionId: number) {
  await prisma.mentorToStudentSession.delete({
    where: {
      id: sessionId,
    },
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
