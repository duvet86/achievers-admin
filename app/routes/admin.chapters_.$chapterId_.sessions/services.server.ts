import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";
import { searchAcrossFields } from "~/services/.server";

export async function getChapterAsync(chapterId: Chapter["id"]) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id: chapterId,
    },
    select: {
      name: true,
    },
  });
}

export async function getReportsCountAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
  startDate: Date | null,
  endDate: Date | null,
  isCompleted: boolean | null,
  isSignedOff: boolean | null,
) {
  return await prisma.mentorToStudentSession.count({
    where: whereClause(
      chapterId,
      searchTerm,
      startDate,
      endDate,
      isCompleted,
      isSignedOff,
    ),
  });
}

export async function getReportsAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
  startDate: Date | null,
  endDate: Date | null,
  isCompleted: boolean | null,
  isSignedOff: boolean | null,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: whereClause(
      chapterId,
      searchTerm,
      startDate,
      endDate,
      isCompleted,
      isSignedOff,
    ),
    select: {
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      completedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  chapterId: Chapter["id"],
  searchTerm: string | null,
  startDate: Date | null,
  endDate: Date | null,
  isCompleted: boolean | null,
  isSignedOff: boolean | null,
) {
  return {
    chapterId,
    report: {
      not: null,
    },
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
    OR: searchAcrossFields(searchTerm, (searchTerm: string) => [
      {
        user: {
          firstName: { contains: searchTerm },
        },
      },
      {
        user: {
          lastName: { contains: searchTerm },
        },
      },
    ]),
    AND:
      startDate && endDate
        ? [
            {
              attendedOn: {
                lte: endDate ?? undefined,
              },
            },
            {
              attendedOn: {
                gte: startDate ?? undefined,
              },
            },
          ]
        : undefined,
  };
}
