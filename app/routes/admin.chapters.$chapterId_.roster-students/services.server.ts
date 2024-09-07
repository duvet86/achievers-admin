import type { Chapter, Prisma } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

export type SessionLookup = Record<
  string,
  | {
      sessionId: number;
      mentorFullName: string;
      hasReport: boolean;
      isCancelled: boolean;
    }
  | undefined
>;

export async function getSchoolTermsForYearAsync(
  year: number,
): Promise<Term[]> {
  const terms = await prisma.schoolTerm.findMany({
    where: {
      year,
    },
    select: {
      startDate: true,
      endDate: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return terms.map<Term>(({ startDate, endDate }, index) => ({
    name: "Term " + (index + 1),
    start: dayjs.utc(startDate),
    end: dayjs.utc(endDate),
  }));
}

export function getCurrentTermForDate(terms: Term[], date: Date): Term {
  for (let i = 0; i < terms.length; i++) {
    if (
      dayjs(date).isBetween(terms[i].start, terms[i].end, "day", "[]") ||
      (terms[i - 1] &&
        dayjs(date).isBetween(terms[i - 1].end, terms[i].start, "day", "[]"))
    ) {
      return terms[i];
    }
  }

  return terms[0];
}

export async function getStudentsAsync(
  chapterId: Chapter["id"],
  sortFullName: Prisma.SortOrder | undefined,
) {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
    },
    select: {
      id: true,
      fullName: true,
      mentorToStudentSession: {
        select: {
          id: true,
          attendedOn: true,
          hasReport: true,
          isCancelled: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      fullName: sortFullName ?? "asc",
    },
  });

  return students.map((student) => {
    const sessionLookup = student.mentorToStudentSession.reduce<SessionLookup>(
      (res, session) => {
        res[dayjs.utc(session.attendedOn).format("YYYY-MM-DD")] = {
          mentorFullName: session.user.fullName,
          sessionId: session.id,
          hasReport: session.hasReport,
          isCancelled: session.isCancelled,
        };

        return res;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mentorToStudentSession, ...rest } = student;

    return {
      ...rest,
      sessionLookup,
    };
  });
}
