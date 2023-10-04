import type { Chapter, Prisma } from "@prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export interface SessionCheckboxState {
  disabled: boolean;
  checked: boolean;
}

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

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function createSessionAsync(
  data: Prisma.XOR<
    Prisma.MentorToStudentSessionCreateInput,
    Prisma.MentorToStudentSessionUncheckedCreateInput
  >,
) {
  return await prisma.mentorToStudentSession.create({
    data,
  });
}

export async function deleteSessionAsync(
  data: Prisma.MentorToStudentSessionUserIdStudentIdChapterIdAttendedOnCompoundUniqueInput,
) {
  return await prisma.mentorToStudentSession.delete({
    where: {
      userId_studentId_chapterId_attendedOn: data,
    },
  });
}

export async function getStateAsync(chapterId: Chapter["id"], term: Term) {
  const datesInTerm = getDatesForTerm(term);

  const mentors = await getMentorsForChapter(chapterId, term);

  const students = mentors.flatMap(({ mentorToStudentAssignement }, i) =>
    mentorToStudentAssignement.map((assignement) => ({
      mentorId: i,
      ...assignement,
    })),
  );

  const sessions = mentors.flatMap(
    ({ mentorToStudentSession }) => mentorToStudentSession,
  );

  const studentsLookup = students.reduce<
    Record<string, Record<string, Record<string, SessionCheckboxState>>>
  >((res, { studentId, userId }) => {
    for (const sessionDate of datesInTerm) {
      if (res[studentId]) {
        if (res[studentId][sessionDate.toISOString()]) {
          res[studentId][sessionDate.toISOString()][userId] = {
            disabled: false,
            checked: false,
          };
        } else {
          res[studentId][sessionDate.toISOString()] = {
            [userId]: {
              disabled: false,
              checked: false,
            },
          };
        }
      } else {
        res[studentId] = {
          [sessionDate.toISOString()]: {
            [userId]: {
              disabled: false,
              checked: false,
            },
          },
        };
      }
    }

    return res;
  }, {});

  sessions.forEach(({ studentId, userId, attendedOn }) => {
    studentsLookup[studentId][attendedOn.toISOString()] = Object.keys(
      studentsLookup[studentId][attendedOn.toISOString()],
    ).reduce<Record<string, SessionCheckboxState>>((res, key) => {
      if (key === userId.toString()) {
        res[key] = {
          disabled: false,
          checked: true,
        };
      } else {
        res[key] = {
          disabled: true,
          checked: false,
        };
      }

      return res;
    }, {});
  });

  return {
    students,
    studentsLookup,
    mentors: mentors.map(
      ({
        firstName,
        lastName,
        frequencyInDays,
        mentorToStudentAssignement,
      }) => ({
        firstName,
        lastName,
        frequencyInDays,
        mentorToStudentAssignement,
      }),
    ),
    datesInTerm: datesInTerm.map((d) => d.toISOString()),
  };
}

function getDatesForTerm(selectedTerm: Term) {
  let firstDayOfTermStart = selectedTerm.start.startOf("week");
  const firstDayOfTermEnd = selectedTerm.end.startOf("week");

  if (firstDayOfTermStart < selectedTerm.start) {
    firstDayOfTermStart = firstDayOfTermStart.add(1, "week");
  }

  const numberOfWeeksInTerm = firstDayOfTermEnd.diff(
    firstDayOfTermStart,
    "week",
  );

  const dates: Date[] = [];
  for (let i = 0; i <= numberOfWeeksInTerm; i++) {
    const date = firstDayOfTermStart.clone().add(i, "week").toDate();
    dates.push(date);
  }

  return dates;
}

async function getMentorsForChapter(chapterId: Chapter["id"], term: Term) {
  return await prisma.user.findMany({
    where: {
      userAtChapter: {
        some: {
          chapterId,
        },
      },
      mentorToStudentAssignement: {
        some: {},
      },
      OR: [
        {
          mentorToStudentSession: {
            some: {
              attendedOn: {
                lte: term.end.toISOString(),
                gte: term.start.toISOString(),
              },
            },
          },
        },
        {
          mentorToStudentSession: {
            none: {},
          },
        },
      ],
    },
    select: {
      firstName: true,
      lastName: true,
      frequencyInDays: true,
      mentorToStudentAssignement: {
        select: {
          studentId: true,
          userId: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      mentorToStudentSession: {
        select: {
          attendedOn: true,
          studentId: true,
          userId: true,
        },
      },
    },
  });
}
