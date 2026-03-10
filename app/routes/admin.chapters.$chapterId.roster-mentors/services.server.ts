import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

import { Prisma } from "~/prisma/client";
import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

interface MentorSession {
  mentorSessionId: number;
  status: SessionStatus;
  attendedOn: string;
  mentorId: number;
  sessionId: number | null;
  hasReport: number | null;
  completedOn: string | null;
  isCancelled: number | null;
  studentId: number | null;
  studentFullName: string | null;
}

interface SessionForLookup {
  mentorSessionId: number;
  status: SessionStatus;
  attendedOn: string;
  mentorId: number;
  sessionId: number;
  hasReport: boolean;
  completedOn: string | null;
  isCancelled: boolean;
  studentId: number;
  studentFullName: string;
}

type SessionLookup = Record<
  string,
  {
    mentorSessionId: number;
    status: SessionStatus;
    attendedOn: string;
    mentorId: number;
    sessions: SessionForLookup[];
  }
>;

export interface SessionViewModel {
  sessionLookup?: SessionLookup;
  id: number;
  fullName: string;
}

export async function getMentorsAsync(
  chapterId: number,
  term: Term,
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | null,
  status: string | null,
  termDate: string | null,
): Promise<SessionViewModel[]> {
  const mentors =
    status === null
      ? await prisma.mentor.findMany({
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
        })
      : await prisma.$queryRaw<{ id: number; fullName: string }[]>`
        SELECT
          DISTINCT
          m.id,
          m.fullName
        FROM Mentor m
        INNER JOIN MentorSession ms ON ms.MentorId = m.Id
        WHERE m.endDate IS NULL
          AND m.chapterId = ${chapterId}
          AND ${searchTerm ? Prisma.sql`m.fullName LIKE %${searchTerm}%` : "1=1"}
          AND ms.attendedOn ${termDate ? Prisma.sql`= ${dayjs(termDate).format("YYYY-MM-DD")}` : Prisma.sql`BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`}
          AND ms.status = ${status}
        ORDER BY m.fullName ${sortFullName ? Prisma.sql`${sortFullName}` : Prisma.sql`ASC`}
  `;

  const mentorSessions = await prisma.$queryRaw<MentorSession[]>`
      SELECT
        ms.id AS mentorSessionId,
        ms.status,
        ms.attendedOn,
        ms.mentorId,
        sa.id AS sessionId,
        sa.hasReport,
        sa.completedOn,
        sa.isCancelled,
        ss.studentId,
        s.fullName AS studentFullName
      FROM MentorSession ms
      LEFT JOIN Session sa ON sa.mentorSessionId = ms.id
      LEFT JOIN StudentSession ss ON ss.id = sa.studentSessionId
      LEFT JOIN Student s ON s.id = ss.studentId
      WHERE ms.chapterId = ${chapterId}
        AND ms.attendedOn ${termDate ? Prisma.sql`= ${dayjs(termDate).format("YYYY-MM-DD")}` : Prisma.sql`BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`}
        AND ${status ? Prisma.sql`ms.status = ${status}` : "1=1"}`;

  const mentorSessionLookup = mentorSessions.reduce<
    Record<string, SessionLookup>
  >((res, mentorSession) => {
    const attendedOn = dayjs.utc(mentorSession.attendedOn).format("YYYY-MM-DD");

    const session: SessionForLookup = {
      mentorSessionId: mentorSession.mentorSessionId,
      attendedOn: mentorSession.attendedOn,
      status: mentorSession.status,
      mentorId: mentorSession.mentorId,
      studentId: mentorSession.studentId!,
      sessionId: mentorSession.sessionId!,
      hasReport: mentorSession.hasReport === 1,
      completedOn: mentorSession.completedOn,
      isCancelled: mentorSession.isCancelled === 1,
      studentFullName: mentorSession.studentFullName!,
    };

    if (res[mentorSession.mentorId]) {
      if (res[mentorSession.mentorId][attendedOn]) {
        if (session.sessionId !== null) {
          res[mentorSession.mentorId][attendedOn].sessions.push(session);
        }
      } else {
        res[mentorSession.mentorId][attendedOn] = {
          mentorSessionId: mentorSession.mentorSessionId,
          attendedOn: mentorSession.attendedOn,
          status: mentorSession.status,
          mentorId: mentorSession.mentorId,
          sessions: session.sessionId !== null ? [session] : [],
        };
      }
    } else {
      res[mentorSession.mentorId] = {
        [attendedOn]: {
          mentorSessionId: mentorSession.mentorSessionId,
          attendedOn: mentorSession.attendedOn,
          status: mentorSession.status,
          mentorId: mentorSession.mentorId,
          sessions: session.sessionId !== null ? [session] : [],
        },
      };
    }

    return res;
  }, {});

  return mentors.map((mentor) => {
    const session = mentorSessionLookup[mentor.id.toString()];
    if (session === undefined) {
      return mentor;
    }

    return {
      ...mentor,
      sessionLookup: session,
    };
  });
}
