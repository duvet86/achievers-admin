import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import { write, utils } from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { getCurrentTermForDate, getDatesForTerm } from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";

dayjs.extend(utc);

interface StudentSession {
  status: SessionStatus;
  attendedOn: string;
  studentId: number;
  isCancelled: number | null;
  mentorFullName: string | null;
}

interface SessionViewModelLookup {
  sessionLookup?: Record<string, StudentSession>;
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

        let label = "";
        if (session) {
          if (session.mentorFullName !== null) {
            label =
              session.mentorFullName +
              (session.isCancelled ? " (Cancelled)" : "");
          } else if (session.status === "UNAVAILABLE") {
            label = "Unavailable";
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
): Promise<SessionViewModelLookup[]> {
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

  const studentSessions = await prisma.$queryRaw<StudentSession[]>`
    SELECT
      ss.status,
      ss.attendedOn,
      ss.studentId,
      sa.isCancelled,
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
        attendedOn: value.attendedOn,
        status: value.status,
        studentId: value.studentId,
        isCancelled: value.isCancelled,
        mentorFullName: value.mentorFullName,
      };
    } else {
      res[value.studentId] = {
        [dayjs.utc(value.attendedOn).format("YYYY-MM-DD")]: {
          attendedOn: value.attendedOn,
          status: value.status,
          studentId: value.studentId,
          isCancelled: value.isCancelled,
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
