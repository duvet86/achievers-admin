import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";

import { prisma } from "~/db.server";

dayjs.extend(utc);
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
  userId: number,
  selectedStudentId: number,
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
      fullName: true,
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
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
        res[dayjs.utc(session.attendedOn).format("YYYY-MM-DD")] = {
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
          res[assignment.user.id] = assignment.user.fullName;

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
    students,
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
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
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
