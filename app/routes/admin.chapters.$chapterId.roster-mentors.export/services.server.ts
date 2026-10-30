import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { Prisma } from "~/prisma/client";
import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";
import { addCollectionToSpreadsheet } from "~/services/.server";

dayjs.extend(utc);

interface VolunteerSession {
  volunteerSessionId: number;
  status: SessionStatus;
  attendedOn: string;
  volunteerId: number;
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
    volunteerSessionId: number;
    status: SessionStatus;
    attendedOn: string;
    volunteerId: number;
    sessions: {
      volunteerSessionId: number;
      status: SessionStatus;
      attendedOn: string;
      volunteerId: number;
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
  selectedTermDate: string | null = null,
  search: string | null = null,
  selectedStatus: string | null = null,
  sortFullName: Prisma.SortOrder = "asc",
) {
  const sessionDates = getDatesForTerm(
    selectedTerm.start,
    selectedTerm.end,
  ).filter((date) => selectedTermDate === null || date === selectedTermDate);
  const mentors = await getMentorsAsync(
    chapterId,
    selectedTerm,
    selectedTermDate,
    search,
    selectedStatus,
    sortFullName,
  );

  const spreadsheet = mentors.map(({ fullName, sessionLookup }) => {
    const result: Record<string, string> = { Mentors: fullName };

    sessionDates.forEach((attendedOn) => {
      const attendedOnFormatted = dayjs(attendedOn).format("YYYY-MM-DD");
      const volunteerSession = sessionLookup?.[attendedOnFormatted];

      let label = "";
      if (volunteerSession) {
        if (volunteerSession.sessions.length === 0) {
          if (volunteerSession.status === "UNAVAILABLE") {
            label = "Unavailable";
          } else {
            label = "Available";
          }
        } else if (volunteerSession.sessions.length === 1) {
          const session = volunteerSession.sessions[0];
          label = `${session.studentFullName} (Year ${session.yearLevel ?? "-"})${session.isCancelled ? " (Cancelled)" : ""}`;
        } else {
          label = `${volunteerSession.sessions.length} Students`;
        }
      }

      result[attendedOnFormatted] = label;
    });

    return result;
  });

  return addCollectionToSpreadsheet(spreadsheet);
}

export async function getMentorsAsync(
  chapterId: number,
  term: Term,
  selectedTermDate: string | null = null,
  search: string | null = null,
  selectedStatus: string | null = null,
  sortFullName: Prisma.SortOrder = "asc",
): Promise<SessionViewModel[]> {
  const mentors = await prisma.volunteer.findMany({
    where: {
      endDate: null,
      chapterId,
      fullName: search ? { contains: search } : undefined,
      volunteerSession: selectedStatus
        ? {
            some: {
              chapterId,
              status: selectedStatus as SessionStatus,
              attendedOn: selectedTermDate
                ? dayjs(selectedTermDate).toDate()
                : { gte: term.start.toDate(), lte: term.end.toDate() },
            },
          }
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: sortFullName,
    },
  });

  const volunteerSessions = await prisma.$queryRaw<VolunteerSession[]>`
      SELECT
        ms.id AS volunteerSessionId,
        ms.status,
        ms.attendedOn,
        ms.volunteerId,
        sa.id AS sessionId,
        sa.hasReport,
        sa.completedOn,
        sa.isCancelled,
        ss.studentId,
        s.fullName AS studentFullName,
        s.yearLevel
      FROM VolunteerSession ms
      LEFT JOIN Session sa ON sa.volunteerSessionId = ms.id
      LEFT JOIN StudentSession ss ON ss.id = sa.studentSessionId
      LEFT JOIN Student s ON s.id = ss.studentId
      WHERE ms.chapterId = ${chapterId}
        AND ms.attendedOn ${selectedTermDate ? Prisma.sql`= ${dayjs(selectedTermDate).format("YYYY-MM-DD")}` : Prisma.sql`BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`}
        ${selectedStatus ? Prisma.sql`AND ms.status = ${selectedStatus}` : Prisma.empty}`;

  const volunteerSessionLookup = volunteerSessions.reduce<
    Record<string, SessionLookup>
  >((res, volunteerSession) => {
    const attendedOn = dayjs
      .utc(volunteerSession.attendedOn)
      .format("YYYY-MM-DD");

    const session = {
      volunteerSessionId: volunteerSession.volunteerSessionId,
      attendedOn: volunteerSession.attendedOn,
      status: volunteerSession.status,
      volunteerId: volunteerSession.volunteerId,
      studentId: volunteerSession.studentId!,
      sessionId: volunteerSession.sessionId!,
      hasReport: volunteerSession.hasReport === 1,
      completedOn: volunteerSession.completedOn,
      isCancelled: volunteerSession.isCancelled === 1,
      studentFullName: volunteerSession.studentFullName!,
      yearLevel: volunteerSession.yearLevel,
    };

    if (res[volunteerSession.volunteerId]) {
      if (res[volunteerSession.volunteerId][attendedOn]) {
        if (session.sessionId !== null) {
          res[volunteerSession.volunteerId][attendedOn].sessions.push(session);
        }
      } else {
        res[volunteerSession.volunteerId][attendedOn] = {
          volunteerSessionId: volunteerSession.volunteerSessionId,
          attendedOn: volunteerSession.attendedOn,
          status: volunteerSession.status,
          volunteerId: volunteerSession.volunteerId,
          sessions: session.sessionId !== null ? [session] : [],
        };
      }
    } else {
      res[volunteerSession.volunteerId] = {
        [attendedOn]: {
          volunteerSessionId: volunteerSession.volunteerSessionId,
          attendedOn: volunteerSession.attendedOn,
          status: volunteerSession.status,
          volunteerId: volunteerSession.volunteerId,
          sessions: session.sessionId !== null ? [session] : [],
        },
      };
    }

    return res;
  }, {});

  return mentors.map((mentor) => {
    const session = volunteerSessionLookup[mentor.id.toString()];
    if (session === undefined) {
      return mentor;
    }

    return {
      ...mentor,
      sessionLookup: session,
    };
  });
}
