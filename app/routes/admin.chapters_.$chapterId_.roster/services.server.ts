import type { Chapter } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

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
    start: dayjs(startDate),
    end: dayjs(endDate),
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

export async function getStudentsAsync(chapterId: Chapter["id"]) {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mentorToStudentSession: {
        select: {
          id: true,
          attendedOn: true,
          hasReport: true,
          isCancelled: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return students.map((student) => {
    const sessionLookup = student.mentorToStudentSession.reduce<SessionLookup>(
      (res, session) => {
        res[session.attendedOn.toISOString()] = {
          mentorFullName: `${session.user.firstName} ${session.user.lastName}`,
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
