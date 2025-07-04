import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import { write, utils } from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";

dayjs.extend(utc);

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
  yearLevel: number | null;
}

type SessionLookup = Record<
  string,
  {
    mentorSessionId: number;
    status: SessionStatus;
    attendedOn: string;
    mentorId: number;
    sessions: {
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
      yearLevel: number | null;
    }[];
  }
>;

interface SessionViewModel {
  sessionLookup?: SessionLookup;
  id: number;
  fullName: string;
}

export async function exportRosterToSpreadsheetAsync(
  chapterId: number,
  selectedTerm: Term,
) {
  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);
  const mentors = await getMentorsAsync(chapterId, selectedTerm);

  const spreadsheet = mentors.map(({ fullName, sessionLookup }) => {
    const result: Record<string, string> = { Mentors: fullName };

    sessionDates.forEach((attendedOn) => {
      const attendedOnFormatted = dayjs(attendedOn).format("YYYY-MM-DD");
      const mentorSession = sessionLookup?.[attendedOnFormatted];

      let label = "";
      if (mentorSession) {
        if (mentorSession.sessions.length === 0) {
          if (mentorSession.status === "UNAVAILABLE") {
            label = "Unavailable";
          } else {
            label = "Available";
          }
        } else if (mentorSession.sessions.length === 1) {
          const session = mentorSession.sessions[0];
          label = `${session.studentFullName} (Year ${session.yearLevel ?? "-"})${session.isCancelled ? " (Cancelled)" : ""}`;
        } else {
          label = `${mentorSession.sessions.length} Students`;
        }
      }

      result[attendedOnFormatted] = label;
    });

    return result;
  });

  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.json_to_sheet(spreadsheet));

  const buf = write(wb, { type: "buffer", bookType: "xlsx" }) as ReadableStream;

  return buf;
}

export async function getMentorsAsync(
  chapterId: number,
  term: Term,
): Promise<SessionViewModel[]> {
  const mentors = await prisma.user.findMany({
    where: {
      endDate: null,
      chapterId,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

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
        s.fullName AS studentFullName,
        s.yearLevel
      FROM MentorSession ms
      LEFT JOIN Session sa ON sa.mentorSessionId = ms.id
      LEFT JOIN StudentSession ss ON ss.id = sa.studentSessionId
      LEFT JOIN Student s ON s.id = ss.studentId
      WHERE ms.chapterId = ${chapterId}
        AND ms.attendedOn BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`;

  const mentorSessionLookup = mentorSessions.reduce<
    Record<string, SessionLookup>
  >((res, mentorSession) => {
    const attendedOn = dayjs.utc(mentorSession.attendedOn).format("YYYY-MM-DD");

    const session = {
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
      yearLevel: mentorSession.yearLevel,
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
