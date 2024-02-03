import type { Prisma, User } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export interface SessionCommand {
  chapterId: string;
  studentId: string;
  userId: string;
  attendOn: string;
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

export async function getMentorStudentsAsync(mentorId: User["id"]) {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      mentorToStudentAssignement: {
        some: {
          userId: mentorId,
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

  return students.map((student) => {
    const sessionLookup = student.mentorToStudentSession.reduce<
      Record<string, number>
    >((res, val) => {
      res[val.attendedOn.toISOString()] = val.userId;

      return res;
    }, {});

    const { mentorToStudentSession, ...rest } = student;

    return {
      ...rest,
      sessionLookup,
    };
  });
}

export async function createSessionAsync(
  {
    attendedOn,
    studentId,
    chapterId,
  }: Prisma.MentorToStudentSessionUserIdStudentIdChapterIdAttendedOnCompoundUniqueInput,
  data: Prisma.XOR<
    Prisma.MentorToStudentSessionCreateInput,
    Prisma.MentorToStudentSessionUncheckedCreateInput
  >,
) {
  return await prisma.$transaction(async (tx) => {
    await tx.mentorToStudentSession.deleteMany({
      where: {
        attendedOn,
        studentId,
        chapterId,
      },
    });

    return await tx.mentorToStudentSession.create({
      data,
    });
  });
}

export function getDatesForTerm(selectedTerm: Term) {
  let firstDayOfTermStart = selectedTerm.start.startOf("week").day(6);
  const firstDayOfTermEnd = selectedTerm.end.startOf("week").day(6);

  if (firstDayOfTermStart < selectedTerm.start) {
    firstDayOfTermStart = firstDayOfTermStart.add(1, "week");
  }

  const numberOfWeeksInTerm = firstDayOfTermEnd.diff(
    firstDayOfTermStart,
    "week",
  );

  const dates: string[] = [];
  for (let i = 0; i <= numberOfWeeksInTerm; i++) {
    const date = firstDayOfTermStart.clone().add(i, "week").toISOString();
    dates.push(date);
  }

  return dates;
}
