import type { Student, User } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export interface SessionCommand {
  chapterId: number;
  studentId: number;
  userId: number;
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

export interface SessionCommandRequest {
  action: "assign" | "remove";
  sessionId: string | undefined;
  chapterId: number;
  studentId: number;
  userId: number;
  attendedOn: string;
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

export async function getStudentsAsync(
  userId: User["id"],
  selectedStudentId: Student["id"],
) {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      mentorToStudentAssignement: {
        some: {
          userId,
        },
      },
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

  let sessionDateToMentorIdForAllStudentsLookup: SessionLookup = {};

  const studentsWithSessions = students.map((student) => {
    const sessionDateToMentorIdForStudentLookup =
      student.mentorToStudentSession.reduce<SessionLookup>((res, session) => {
        res[session.attendedOn.toISOString()] = {
          userId: session.userId,
          sessionId: session.id,
          hasReport: session.hasReport,
          isCancelled: session.isCancelled,
        };

        return res;
      }, {});

    const mentorIdToMentorNameForStudentLookup =
      student.mentorToStudentAssignement.reduce<Record<string, string>>(
        (res, assignment) => {
          res[assignment.user.id] =
            `${assignment.user.firstName} ${assignment.user.lastName}`;

          return res;
        },
        {},
      );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mentorToStudentSession, mentorToStudentAssignement, ...rest } =
      student;

    sessionDateToMentorIdForAllStudentsLookup = {
      ...sessionDateToMentorIdForAllStudentsLookup,
      ...sessionDateToMentorIdForStudentLookup,
    };

    return {
      ...rest,
      mentorIdToMentorNameForStudentLookup,
      sessionDateToMentorIdForStudentLookup,
    };
  });

  const selectedStudent =
    studentsWithSessions.find((s) => s.id === selectedStudentId) ??
    studentsWithSessions[0];

  return {
    selectedStudent,
    sessionDateToMentorIdForAllStudentsLookup,
    students: students.map(({ id, firstName, lastName }) => ({
      id,
      firstName,
      lastName,
    })),
  };
}

export async function createSessionAsync({
  userId,
  attendedOn,
  studentId,
  chapterId,
}: SessionCommand) {
  return await prisma.mentorToStudentSession.create({
    data: {
      attendedOn,
      chapterId,
      userId,
      studentId,
    },
  });
}

export async function removeSessionAsync(sessionId: number) {
  await prisma.mentorToStudentSession.delete({
    where: {
      id: sessionId,
    },
  });
}
