import type { Chapter, Prisma } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export interface SessionCommand {
  studentId: string;
  userId: string;
  attendOn: string;
}

export const terms: Term[] = [
  {
    name: "Term 1",
    start: dayjs("2023-02-01"),
    end: dayjs("2023-04-06"),
  },
  {
    name: "Term 2",
    start: dayjs("2023-04-24"),
    end: dayjs("2023-06-30"),
  },
  {
    name: "Term 3",
    start: dayjs("2023-07-17"),
    end: dayjs("2023-09-22"),
  },
  {
    name: "Term 4",
    start: dayjs("2023-10-09"),
    end: dayjs("2023-12-14"),
  },
];

export function getCurrentTermForDate(date: Date): Term {
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
      studentAtChapter: {
        some: {
          chapterId,
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
  let firstDayOfTermStart = selectedTerm.start.startOf("week");
  const firstDayOfTermEnd = selectedTerm.end.startOf("week");

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
