import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";
import { addCollectionToSpreadsheet } from "~/services/.server";

dayjs.extend(utc);

interface StudentSession {
  status: SessionStatus;
  attendedOn: string;
  studentId: number;
  isCancelled: number | null;
  mentorPreferredName: string | null;
  mentorLastName: string | null;
}

interface SessionViewModelLookup {
  sessionLookup?: Record<string, StudentSession>;
  id: number;
  firstName: string;
  yearLevel: number | null;
}

export async function exportRosterToSpreadsheetAsync(
  chapterId: number,
  selectedTerm: Term,
) {
  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);
  const students = await getStudentsAsync(chapterId, selectedTerm);

  const spreadsheet = students.map(
    ({ firstName, yearLevel, sessionLookup }) => {
      const result: Record<string, string> = {
        Students: `${firstName} (Year ${yearLevel ?? "-"})`,
      };

      sessionDates.forEach((attendedOn) => {
        const attendedOnFormatted = dayjs(attendedOn).format("YYYY-MM-DD");
        const session = sessionLookup?.[attendedOnFormatted];

        let label = "";
        if (session) {
          if (session.mentorPreferredName !== null) {
            label =
              `${session.mentorPreferredName ?? ""} ${session.mentorLastName ?? ""}`.trim() +
              (session.isCancelled ? " (Cancelled)" : "");
          } else if (session.status === "UNAVAILABLE") {
            label = "Unavailable";
          }
        }

        result[attendedOnFormatted] = label;
      });

      return result;
    },
  );

  return addCollectionToSpreadsheet(spreadsheet);
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
      firstName: true,
      yearLevel: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  const studentSessions = await prisma.$queryRaw<StudentSession[]>`
    SELECT
      ss.status,
      ss.attendedOn,
      ss.studentId,
      sa.isCancelled,
      u.preferredName AS mentorPreferredName,
      u.lastName AS mentorLastName
    FROM StudentSession ss
    LEFT JOIN Session sa ON sa.studentSessionId = ss.id
    LEFT JOIN MentorSession ms ON ms.id = sa.mentorSessionId
    LEFT JOIN Mentor u ON u.id = ms.mentorId
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
        mentorPreferredName: value.mentorPreferredName,
        mentorLastName: value.mentorLastName,
      };
    } else {
      res[value.studentId] = {
        [dayjs.utc(value.attendedOn).format("YYYY-MM-DD")]: {
          attendedOn: value.attendedOn,
          status: value.status,
          studentId: value.studentId,
          isCancelled: value.isCancelled,
          mentorPreferredName: value.mentorPreferredName,
          mentorLastName: value.mentorLastName,
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
