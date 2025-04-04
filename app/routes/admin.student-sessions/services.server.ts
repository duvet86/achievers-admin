import type { AppAbility } from "~/services/.server";
import type { Term } from "~/models";

import { accessibleBy } from "@casl/prisma";

import { prisma } from "~/db.server";

export async function getChaptersAsync(ability: AppAbility) {
  return await prisma.chapter.findMany({
    where: accessibleBy(ability).Chapter,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAvailabelMentorsAsync(
  ability: AppAbility,
  chapterId: number,
  studentId: number | undefined,
) {
  return await prisma.user.findMany({
    where: {
      chapter: accessibleBy(ability).Chapter,
      chapterId,
      mentorToStudentAssignement: {
        some: {
          studentId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
}

export async function getAvailabelStudentsAsync(
  ability: AppAbility,
  chapterId: number,
  mentorId: number | undefined,
) {
  return await prisma.student.findMany({
    where: {
      chapter: accessibleBy(ability).Chapter,
      chapterId,
      mentorToStudentAssignement: {
        some: {
          userId: mentorId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
}

export async function getCountAsync(
  chapterId: number,
  term: Term,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  includeSignedOff: boolean | undefined,
) {
  return await prisma.studentSession.count({
    where: whereClause(
      chapterId,
      term,
      termDate,
      mentorId,
      studentId,
      includeSignedOff,
    ),
  });
}

export async function getStudentSessionsAsync(
  chapterId: number,
  term: Term,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  includeSignedOff: boolean | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.studentSession.findMany({
    where: whereClause(
      chapterId,
      term,
      termDate,
      mentorId,
      studentId,
      includeSignedOff,
    ),
    select: {
      id: true,
      completedOn: true,
      signedOffOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: {
        attendedOn: "desc",
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  chapterId: number,
  term: Term,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  includeSignedOff: boolean | undefined,
) {
  return {
    studentId,
    completedOn: {
      not: null,
    },
    signedOffOn: includeSignedOff ? undefined : null,
    session: {
      mentorId,
      chapterId,
      AND: termDate
        ? [
            {
              attendedOn: termDate,
            },
          ]
        : [
            {
              attendedOn: {
                lte: term.end.toDate(),
              },
            },
            {
              attendedOn: {
                gte: term.start.toDate(),
              },
            },
          ],
    },
  };
}
