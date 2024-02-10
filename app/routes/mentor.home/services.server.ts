import type { Chapter, MentorToStudentSession, User } from "@prisma/client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";

dayjs.extend(isBetween);

export async function getNextSessionAsync(year: number) {
  const today = dayjs();

  const currentTerms = await prisma.schoolTerm.findMany({
    where: {
      year,
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  const currentTerm = currentTerms.find((term) =>
    today.isBetween(term.startDate, term.endDate, "day", "[]"),
  );

  if (currentTerm === undefined) {
    return null;
  }

  const sessionsForTerm = getDatesForTerm(
    dayjs(currentTerm.startDate),
    dayjs(currentTerm.endDate),
  );

  const nextSessionDate =
    sessionsForTerm.find((a, b) => today.isBetween(a, b, "day", "[]")) ?? null;

  if (nextSessionDate === undefined) {
    return null;
  }

  return nextSessionDate;
}

export async function getStudentForSessionAsync(
  mentorId: User["id"],
  chapterId: Chapter["id"],
  sessionDate: MentorToStudentSession["attendedOn"],
) {
  const mentorToStudentSession = await prisma.mentorToStudentSession.findFirst({
    where: {
      userId: mentorId,
      chapterId,
      attendedOn: sessionDate,
    },
    select: {
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (mentorToStudentSession === null) {
    return null;
  }

  return mentorToStudentSession.student;
}
