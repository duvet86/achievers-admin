import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import { write, utils } from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { getCurrentTermForDate, getDatesForTerm } from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";

dayjs.extend(utc);

type SessionLookup = Record<
  string,
  | {
      id: number;
      mentorId: number;
      attendedOn: Date;
      status: SessionStatus;
      sessionAttendance: {
        id: number;
        hasReport: boolean;
        completedOn: Date | null;
        isCancelled: boolean;
        studentSession: {
          id: number;
          student: { id: number; fullName: string; yearLevel: number | null };
        };
      }[];
    }
  | undefined
>;

export interface SessionViewModel {
  sessionLookup?: Record<
    string,
    {
      id: number;
      mentorId: number;
      attendedOn: Date;
      status: SessionStatus;
      sessionAttendance: {
        id: number;
        hasReport: boolean;
        completedOn: Date | null;
        isCancelled: boolean;
        studentSession: {
          id: number;
          student: { id: number; fullName: string; yearLevel: number | null };
        };
      }[];
    }
  >;
  id: number;
  fullName: string;
}

export async function exportRosterToSpreadsheetAsync(
  chapterId: number,
  selectedTerm: string | null,
  selectedTermDate: string | null,
) {
  const terms = await getSchoolTermsAsync();

  const todayterm = getCurrentTermForDate(terms, new Date());
  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;

  const sessionDates = getDatesForTerm(currentTerm.start, currentTerm.end);
  const mentors = await getMentorsAsync(chapterId, currentTerm);

  const spreadsheet = mentors.map(({ fullName, sessionLookup }) => {
    const result: Record<string, string> = { Mentors: fullName };

    sessionDates
      .filter(
        (attendedOn) =>
          attendedOn === selectedTermDate || selectedTermDate === null,
      )
      .forEach((attendedOn) => {
        const attendedOnFormatted = dayjs(attendedOn).format("YYYY-MM-DD");
        const session = sessionLookup?.[attendedOnFormatted];

        const sessionAttendance = session?.sessionAttendance;

        let label = "";
        if (sessionAttendance) {
          if (sessionAttendance.length === 0) {
            label = "Available";
          } else if (sessionAttendance.length === 1) {
            const student = sessionAttendance[0].studentSession.student;
            label = `${student.fullName} (Year ${student.yearLevel ?? "-"})`;
          } else {
            label = `${sessionAttendance.length} Students`;
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

  const mentorSessions = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      attendedOn: {
        gte: term.end.utc().toDate(),
        lte: term.start.utc().toDate(),
      },
    },
    select: {
      id: true,
      status: true,
      attendedOn: true,
      mentorId: true,
      sessionAttendance: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          isCancelled: true,
          studentSession: {
            select: {
              id: true,
              student: {
                select: {
                  id: true,
                  fullName: true,
                  yearLevel: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const mentorSessionsLookup = mentorSessions.reduce<SessionLookup>(
    (res, value) => {
      res[value.mentorId.toString()] = value;

      return res;
    },
    {},
  );

  return mentors.map((mentor) => {
    const session = mentorSessionsLookup[mentor.id.toString()];
    if (session === undefined) {
      return mentor;
    }

    return {
      ...mentor,
      sessionLookup: {
        [dayjs.utc(session.attendedOn).format("YYYY-MM-DD")]: session,
      },
    };
  });
}
