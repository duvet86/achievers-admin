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

export async function getMentorsAsync(
  chapterId: Chapter["id"],
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | undefined,
) {
  const mentors = await prisma.user.findMany({
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
      fullName: sortFullName ?? "asc",
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
