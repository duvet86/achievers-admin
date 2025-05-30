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
      studentId: number;
      attendedOn: Date;
      status: SessionStatus;
      sessionAttendance: {
        id: number;
        hasReport: boolean;
        completedOn: Date | null;
        isCancelled: boolean;
        mentorSession: {
          id: number;
          mentor: { id: number; fullName: string };
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
      studentId: number;
      attendedOn: Date;
      status: SessionStatus;
      sessionAttendance: {
        id: number;
        hasReport: boolean;
        completedOn: Date | null;
        isCancelled: boolean;
        mentorSession: {
          id: number;
          mentor: { id: number; fullName: string };
        };
      }[];
    }
  >;
  id: number;
  fullName: string;
  yearLevel: number | null;
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
  const students = await getStudentsAsync(chapterId, currentTerm);

  const spreadsheet = students.map(({ fullName, yearLevel, sessionLookup }) => {
    const result: Record<string, string> = {
      Students: `${fullName} (Year ${yearLevel ?? "-"})`,
    };

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
            const mentor = sessionAttendance[0].mentorSession.mentor;
            label = mentor.fullName;
          } else {
            label = `${sessionAttendance.length} Mentors`;
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

export async function getStudentsAsync(
  chapterId: number,
  term: Term,
): Promise<SessionViewModel[]> {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
    },
    select: {
      id: true,
      fullName: true,
      yearLevel: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const studentSessions = await prisma.studentSession.findMany({
    where: {
      chapterId,
      attendedOn: {
        gte: term.start.utc().toDate(),
        lte: term.end.utc().toDate(),
      },
    },
    select: {
      id: true,
      status: true,
      attendedOn: true,
      studentId: true,
      sessionAttendance: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          isCancelled: true,
          mentorSession: {
            select: {
              id: true,
              mentor: {
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

  const studentSessionsLookup = studentSessions.reduce<SessionLookup>(
    (res, value) => {
      res[value.studentId.toString()] = value;

      return res;
    },
    {},
  );

  return students.map((student) => {
    const session = studentSessionsLookup[student.id.toString()];
    if (session === undefined) {
      return student;
    }

    return {
      ...student,
      sessionLookup: {
        [dayjs.utc(session.attendedOn).format("YYYY-MM-DD")]: session,
      },
    };
  });
}
