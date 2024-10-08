import type { AppAbility } from "~/services/.server";

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
  mentorId: number | undefined,
  studentId: number | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  isCompleted: boolean | undefined,
  isSignedOff: boolean | undefined,
) {
  return await prisma.mentorToStudentSession.count({
    where: whereClause(
      chapterId,
      mentorId,
      studentId,
      startDate,
      endDate,
      isCompleted,
      isSignedOff,
    ),
  });
}

export async function getSessionsAsync(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  isCompleted: boolean | undefined,
  isSignedOff: boolean | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: whereClause(
      chapterId,
      mentorId,
      studentId,
      startDate,
      endDate,
      isCompleted,
      isSignedOff,
    ),
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [
      {
        completedOn: "desc",
      },
      { attendedOn: "desc" },
    ],
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  isCompleted: boolean | undefined,
  isSignedOff: boolean | undefined,
) {
  return {
    userId: mentorId,
    studentId,
    chapterId,
    completedOn: isCompleted
      ? {
          not: null,
        }
      : undefined,
    signedOffOn: isSignedOff
      ? {
          not: null,
        }
      : undefined,
    AND:
      startDate && endDate
        ? [
            {
              attendedOn: {
                lte: endDate,
              },
            },
            {
              attendedOn: {
                gte: startDate,
              },
            },
          ]
        : undefined,
  };
}
