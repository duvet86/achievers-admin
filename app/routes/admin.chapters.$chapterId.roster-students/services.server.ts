import type { Prisma, SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

interface StudentSession {
  studentSessionId: number;
  status: SessionStatus;
  attendedOn: string;
  studentId: number;
  sessionId: number | null;
  hasReport: number | null;
  completedOn: string | null;
  isCancelled: number | null;
  mentorId: number | null;
  mentorFullName: string | null;
}

type SessionLookup = Record<
  string,
  {
    studentSessionId: number;
    status: SessionStatus;
    attendedOn: string;
    studentId: number;
    sessions: {
      studentSessionId: number;
      status: SessionStatus;
      attendedOn: string;
      studentId: number;
      sessionId: number;
      hasReport: boolean;
      completedOn: string | null;
      isCancelled: boolean;
      mentorId: number;
      mentorFullName: string;
    }[];
  }
>;

export interface SessionViewModel {
  sessionLookup?: SessionLookup;
  id: number;
  fullName: string;
}

export async function getStudentsAsync(
  chapterId: number,
  term: Term,
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | undefined,
): Promise<SessionViewModel[]> {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
      fullName: searchTerm
        ? {
            contains: searchTerm,
          }
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: sortFullName ?? "asc",
    },
  });

  const studentSessions = await prisma.$queryRaw<StudentSession[]>`
    SELECT
      ss.id AS studentSessionId,
      ss.status,
      ss.attendedOn,
      ss.studentId,
      sa.id AS sessionId,
      sa.hasReport,
      sa.completedOn,
      sa.isCancelled,
      ms.mentorId,
      u.fullName AS mentorFullName
    FROM StudentSession ss
    LEFT JOIN Session sa ON sa.studentSessionId = ss.id
    LEFT JOIN MentorSession ms ON ms.id = sa.mentorSessionId
    LEFT JOIN User u ON u.id = ms.mentorId
    WHERE ss.chapterId = ${chapterId}
      AND ss.attendedOn BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`;

  const studentSessionLookup = studentSessions.reduce<
    Record<string, SessionLookup>
  >((res, studentSession) => {
    const attendedOn = dayjs
      .utc(studentSession.attendedOn)
      .format("YYYY-MM-DD");

    const session = {
      studentSessionId: studentSession.studentSessionId,
      status: studentSession.status,
      attendedOn: studentSession.attendedOn,
      studentId: studentSession.studentId,
      mentorId: studentSession.mentorId!,
      sessionId: studentSession.sessionId!,
      hasReport: studentSession.hasReport === 1,
      completedOn: studentSession.completedOn,
      isCancelled: studentSession.isCancelled === 1,
      mentorFullName: studentSession.mentorFullName!,
    };

    if (res[studentSession.studentId]) {
      if (res[studentSession.studentId][attendedOn]) {
        if (session.sessionId !== null) {
          res[studentSession.studentId][attendedOn].sessions.push(session);
        }
      } else {
        res[studentSession.studentId][attendedOn] = {
          studentSessionId: studentSession.studentSessionId,
          attendedOn: studentSession.attendedOn,
          status: studentSession.status,
          studentId: studentSession.studentId,
          sessions: session.sessionId !== null ? [session] : [],
        };
      }
    } else {
      res[studentSession.studentId] = {
        [attendedOn]: {
          studentSessionId: studentSession.studentSessionId,
          attendedOn: studentSession.attendedOn,
          status: studentSession.status,
          studentId: studentSession.studentId,
          sessions: session.sessionId !== null ? [session] : [],
        },
      };
    }

    return res;
  }, {});

  return students.map((student) => {
    const session = studentSessionLookup[student.id.toString()];
    if (session === undefined) {
      return student;
    }

    return {
      ...student,
      sessionLookup: session,
    };
  });
}
