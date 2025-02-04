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
      status: string;
      attendedOn: Date;
      studentSession: {
        id: number;
        hasReport: boolean;
        completedOn: Date | null;
        student: {
          id: number;
          fullName: string;
        };
      }[];
    }
  | undefined
>;

export async function exportRosterToSpreadsheetAsync(
  chapterId: number,
  selectedTerm: string | null,
  selectedTermDate: string | null,
) {
  const terms = await getSchoolTermsAsync(dayjs().year());

  const todayterm = getCurrentTermForDate(terms, new Date());
  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;

  const sessionDates = getDatesForTerm(currentTerm.start, currentTerm.end);
  const mentors = await getMentorsAsync(chapterId);

  const spreadsheet = mentors.map(({ fullName, sessionLookup }) => {
    const result: Record<string, string> = {
      Mentors: fullName,
    };

    sessionDates
      .filter(
        (attendedOn) =>
          attendedOn === selectedTermDate || selectedTermDate === null,
      )
      .forEach((attendedOn) => {
        const attendedOnFormatted = dayjs(attendedOn).format("YYYY-MM-DD");
        const session = sessionLookup[attendedOnFormatted];

        const studentSessions = session?.studentSession;

        let label = "";
        if (studentSessions) {
          if (studentSessions.length === 0) {
            label = "Available";
          } else if (studentSessions.length === 1) {
            label = session.studentSession[0].student.fullName;
          } else {
            label = `${studentSessions.length} Students`;
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

async function getMentorsAsync(chapterId: number) {
  const mentors = await prisma.user.findMany({
    where: {
      endDate: null,
      chapterId,
    },
    select: {
      id: true,
      fullName: true,
      session: {
        select: {
          id: true,
          status: true,
          attendedOn: true,
          studentSession: {
            select: {
              id: true,
              hasReport: true,
              completedOn: true,
              student: {
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

  return mentors.map((mentor) => {
    const sessionLookup = mentor.session.reduce<SessionLookup>(
      (res, session) => {
        res[dayjs.utc(session.attendedOn).format("YYYY-MM-DD")] = session;

        return res;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { session, ...rest } = mentor;

    return {
      ...rest,
      sessionLookup,
    };
  });
}
