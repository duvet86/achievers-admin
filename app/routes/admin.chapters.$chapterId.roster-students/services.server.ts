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

export interface SessionViewModelLookup {
  sessionLookup?: Record<string, StudentSession>;
  id: number;
  fullName: string;
}

export async function getStudentsAsync(
  chapterId: number,
  term: Term,
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | undefined,
): Promise<SessionViewModelLookup[]> {
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
    LEFT JOIN SessionAttendance sa ON sa.studentSessionId = ss.id
    LEFT JOIN MentorSession ms ON ms.id = sa.mentorSessionId
    LEFT JOIN User u ON u.id = ms.mentorId
    WHERE ss.chapterId = ${chapterId}
      AND ss.attendedOn BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`;

  const studentSessionLookup = studentSessions.reduce<
    Record<string, Record<string, StudentSession>>
  >((res, value) => {
    if (res[value.studentId]) {
      res[value.studentId][dayjs.utc(value.attendedOn).format("YYYY-MM-DD")] = {
        studentSessionId: value.studentSessionId,
        attendedOn: value.attendedOn,
        status: value.status,
        studentId: value.studentId,
        sessionId: value.sessionId,
        hasReport: value.hasReport,
        completedOn: value.completedOn,
        isCancelled: value.isCancelled,
        mentorId: value.mentorId,
        mentorFullName: value.mentorFullName,
      };
    } else {
      res[value.studentId] = {
        [dayjs.utc(value.attendedOn).format("YYYY-MM-DD")]: {
          studentSessionId: value.studentSessionId,
          attendedOn: value.attendedOn,
          status: value.status,
          studentId: value.studentId,
          sessionId: value.sessionId,
          hasReport: value.hasReport,
          completedOn: value.completedOn,
          isCancelled: value.isCancelled,
          mentorId: value.mentorId,
          mentorFullName: value.mentorFullName,
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
