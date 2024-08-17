import type { Term } from "~/models";

import dayjs from "dayjs";

import { prisma } from "~/db.server";

export interface SessionViewModel {
  id: number;
  attendedOn: Date;
  completedOn: Date | null;
  signedOffOn: Date | null;
}

export async function getAssignedStudentsAsync(userId: number) {
  const students = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId,
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return students.map(({ student: { id, fullName } }) => ({
    id,
    fullName,
  }));
}

export async function getSessionsAsync(
  userId: number,
  studentId: number,
  startDate: Date | undefined,
  endDate: Date | undefined,
) {
  return await prisma.mentorToStudentSession.findMany({
    select: {
      id: true,
      attendedOn: true,
      signedOffOn: true,
      completedOn: true,
    },
    where: getWhereClause(userId, studentId, startDate, endDate),
    orderBy: {
      attendedOn: "desc",
    },
  });
}

function getWhereClause(
  userId: number,
  studentId: number,
  startDate: Date | undefined,
  endDate: Date | undefined,
) {
  return {
    userId,
    studentId,
    attendedOn: {
      lte: dayjs().add(1, "week").toDate(),
    },
    AND: [
      {
        attendedOn: {
          lte: endDate,
        },
      },
      {
        attendedOn: {
          gte: startDate,
        },
      },
    ],
  };
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
    },
  });
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
