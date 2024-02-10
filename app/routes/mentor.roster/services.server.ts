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
          attendedOn: true,
          userId: true,
        },
      },
    },
  });

  let allStudentsSessionLookup: Record<string, number> = {};

  const studentsWithSessions = students.map((student) => {
    const sessionLookup = student.mentorToStudentSession.reduce<
      Record<string, number>
    >((res, val) => {
      res[val.attendedOn.toISOString()] = val.userId;

      return res;
    }, {});

    const mentorToStudentLookup = student.mentorToStudentAssignement.reduce<
      Record<string, string>
    >((res, val) => {
      res[val.user.id] = `${val.user.firstName} ${val.user.lastName}`;

      return res;
    }, {});

    const { mentorToStudentSession, mentorToStudentAssignement, ...rest } =
      student;

    allStudentsSessionLookup = {
      ...allStudentsSessionLookup,
      ...sessionLookup,
    };

    return {
      ...rest,
      mentorToStudentLookup,
      sessionLookup,
    };
  });

  const selectedStudent =
    studentsWithSessions.find((s) => s.id === selectedStudentId) ??
    studentsWithSessions[0];

  return {
    selectedStudent,
    allStudentsSessionLookup,
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

export async function removeSessionAsync({
  userId,
  attendedOn,
  studentId,
  chapterId,
}: SessionCommand) {
  await prisma.mentorToStudentSession.delete({
    where: {
      userId_studentId_chapterId_attendedOn: {
        attendedOn,
        chapterId,
        studentId,
        userId,
      },
    },
  });
}
