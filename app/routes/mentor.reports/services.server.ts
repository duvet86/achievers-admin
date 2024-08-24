import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export type ActionType = "completed" | "remove-complete" | "draft";

export interface SessionCommandRequest {
  type: ActionType;
  studentId: number;
  attendedOn: string;
  report: string;
  sessionId: number | null;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}

export async function getSessionAsync(
  userId: number,
  studentId: number,
  chapterId: number,
  attendedOn: Date,
) {
  return await prisma.mentorToStudentSession.findUnique({
    where: {
      userId_studentId_chapterId_attendedOn: {
        userId,
        attendedOn,
        chapterId,
        studentId,
      },
    },
    select: {
      id: true,
      attendedOn: true,
      report: true,
      completedOn: true,
      signedOffOn: true,
      reportFeedback: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

export async function saveReportAsync(
  actionType: ActionType,
  sessionId: number | null,
  userId: number,
  chapterId: number,
  studentId: number,
  attendedOn: Date,
  report: string,
) {
  let completedOn: Date | null;
  switch (actionType) {
    case "completed":
      completedOn = new Date();
      break;
    case "draft":
    case "remove-complete":
    default:
      completedOn = null;
      break;
  }

  if (sessionId === null) {
    return await prisma.mentorToStudentSession.create({
      data: {
        chapterId,
        studentId,
        userId,
        attendedOn,
        report,
        completedOn,
      },
    });
  }

  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
    },
    data: {
      report,
      completedOn,
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

export function getClosestSessionDate(): string {
  const sessionDateFromToday = dayjs().startOf("week").day(6);

  if (sessionDateFromToday > dayjs()) {
    return sessionDateFromToday.add(-1, "week").format("YYYY-MM-DD");
  }

  return sessionDateFromToday.format("YYYY-MM-DD");
}

export async function getStudentsAsync(userId: number, chapterId: number) {
  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: {
        none: {
          userId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
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

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `${fullName} (Assigned)`,
    }))
    .concat(allStudents);
}

export function getTermFromDate(terms: Term[], date: string) {
  return terms.find((term) => dayjs(date).isBetween(term.start, term.end));
}
