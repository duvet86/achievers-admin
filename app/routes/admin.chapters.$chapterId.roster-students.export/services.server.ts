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
      sessionId: number;
      studentSessionId: number;
      mentorId: number;
      mentorFullName: string;
      hasReport: boolean;
      completedOn: Date | null;
      isCancelled: boolean;
    }
  | undefined
>;

export async function exportRosterToSpreadsheetAsync(
  chapterId: number,
  selectedTerm: string | null,
  selectedTermDate: string | null,
) {
  const terms = await getSchoolTermsAsync();

  const todayterm = getCurrentTermForDate(terms, new Date());
  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;

  const sessionDates = getDatesForTerm(currentTerm.start, currentTerm.end);
  const students = await getStudentsAsync(chapterId);

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

        result[attendedOnFormatted] =
          sessionLookup[attendedOnFormatted]?.mentorFullName ?? "";
      });

    return result;
  });

  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.json_to_sheet(spreadsheet));

  const buf = write(wb, { type: "buffer", bookType: "xlsx" }) as ReadableStream;

  return buf;
}

async function getStudentsAsync(chapterId: number) {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
    },
    select: {
      id: true,
      fullName: true,
      yearLevel: true,
      studentSession: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          isCancelled: true,
          session: {
            select: {
              id: true,
              attendedOn: true,
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
    orderBy: {
      fullName: "asc",
    },
  });

  return students.map((student) => {
    const sessionLookup = student.studentSession.reduce<SessionLookup>(
      (res, studentSession) => {
        res[dayjs.utc(studentSession.session.attendedOn).format("YYYY-MM-DD")] =
          {
            sessionId: studentSession.session.id,
            studentSessionId: studentSession.id,
            mentorId: studentSession.session.mentor.id,
            mentorFullName: studentSession.session.mentor.fullName,
            hasReport: studentSession.hasReport,
            completedOn: studentSession.completedOn,
            isCancelled: studentSession.isCancelled,
          };

        return res;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { studentSession, ...rest } = student;

    return {
      ...rest,
      sessionLookup,
    };
  });
}
