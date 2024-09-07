import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

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

export async function getReportForSessionDateAsync(
  studentId: number,
  chapterId: number,
  attendedOn: string,
) {
  return await prisma.mentorToStudentSession.findFirst({
    where: {
      attendedOn,
      chapterId,
      studentId,
    },
    select: {
      id: true,
      userId: true,
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
      user: {
        select: {
          fullName: true,
        },
      },
    },
  });
}

export async function getMentorSessionDatesAsync(
  userId: number,
  studentId: number,
  chapterId: number,
  currentTerm: Term,
) {
  return (
    await prisma.mentorToStudentSession.findMany({
      where: {
        userId,
        chapterId,
        studentId,
        AND: [
          {
            attendedOn: {
              gte: currentTerm.start.toDate(),
            },
          },
          {
            attendedOn: {
              lte: currentTerm.end.toDate(),
            },
          },
        ],
      },
      select: {
        attendedOn: true,
      },
    })
  ).map(({ attendedOn }) => dayjs(attendedOn).format("YYYY-MM-DD"));
}

export function getSessionDatesFormatted(
  sessionDates: string[],
  currentTerm: Term,
  includeAllDates: boolean,
) {
  if (includeAllDates) {
    return getDatesForTerm(currentTerm.start, currentTerm.end)
      .map((attendedOn) => dayjs(attendedOn))
      .map((attendedOn) => ({
        value: attendedOn.format("YYYY-MM-DD") + "T00:00:00Z",
        label: sessionDates.includes(attendedOn.format("YYYY-MM-DD"))
          ? `** ${attendedOn.format("DD/MM/YYYY")} (Booked) **`
          : attendedOn.format("DD/MM/YYYY"),
      }));
  }

  return sessionDates
    .map((attendedOn) => dayjs(attendedOn))
    .map((attendedOn) => ({
      value: attendedOn.format("YYYY-MM-DD") + "T00:00:00Z",
      label: attendedOn.format("DD/MM/YYYY"),
    }));
}

export async function saveReportAsync(
  actionType: ActionType,
  sessionId: number | null,
  userId: number,
  chapterId: number,
  studentId: number,
  attendedOn: string,
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

export function getClosestSessionDate(dates: Date[]) {
  if (dates.length === 0) {
    return null;
  }

  const today = new Date();
  const closest = dates.reduce((a, b) =>
    a.getDate() - today.getDate() < b.getDate() - today.getDate() ? a : b,
  );

  return dayjs(closest).format("YYYY-MM-DD") + "T00:00:00Z";
}

export async function getStudentsAsync(
  userId: number,
  chapterId: number,
  includeAllstudents: boolean,
) {
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

  if (includeAllstudents) {
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

    return assignedStudents
      .map(({ student: { id, fullName } }) => ({
        id,
        fullName: `** ${fullName} (Assigned) **`,
      }))
      .concat(allStudents);
  }

  return assignedStudents.map(({ student: { id, fullName } }) => ({
    id,
    fullName,
  }));
}

export function getTermFromDate(terms: Term[], date: string) {
  return terms.find((term) => dayjs(date).isBetween(term.start, term.end));
}
