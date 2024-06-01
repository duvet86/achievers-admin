import type { Chapter } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export interface SessionCommand {
  sessionId: string | undefined;
  studentId: string;
  userId: string;
  attendedOn: string;
}

export type SessionLookup = Record<
  string,
  | {
      sessionId: number;
      userId: number;
      hasReport: boolean;
      isCancelled: boolean;
    }
  | undefined
>;

interface UpsertSessionCommand {
  sessionId: number | undefined;
  attendedOn: string;
  studentId: number;
  chapterId: number;
  userId: number;
}

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
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      mentorToStudentSession: {
        select: {
          id: true,
          attendedOn: true,
          userId: true,
          hasReport: true,
          isCancelled: true,
        },
      },
    },
  });

  return students.map((student) => {
    const sessionLookup = student.mentorToStudentSession.reduce<SessionLookup>(
      (res, session) => {
        res[session.attendedOn.toISOString()] = {
          userId: session.userId,
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

export async function upsertSessionAsync({
  sessionId,
  attendedOn,
  studentId,
  chapterId,
  userId,
}: UpsertSessionCommand) {
  if (sessionId !== undefined) {
    const isAnyCancelled = await prisma.mentorToStudentSession.findFirst({
      where: {
        attendedOn,
        studentId,
        chapterId,
        isCancelled: true,
      },
    });

    if (isAnyCancelled !== null) {
      throw new Error("Cannot update a cancelled session.");
    }

    return prisma.mentorToStudentSession.update({
      data: {
        attendedOn,
        studentId,
        chapterId,
        userId,
      },
      where: {
        id: sessionId,
      },
    });
  } else {
    return prisma.mentorToStudentSession.create({
      data: {
        attendedOn,
        studentId,
        chapterId,
        userId,
      },
    });
  }
}
