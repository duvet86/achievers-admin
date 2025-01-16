import type { Prisma } from "@prisma/client/index.js";

import { prisma } from "~/db.server";

function getOR(searchTerm: string | null) {
  return searchTerm
    ? [
        {
          fullName: {
            contains: searchTerm,
          },
        },
      ]
    : undefined;
}

export async function getMentorsWithStudentsCountAsync(
  chapterId: number,
  searchTerm: string | null,
) {
  return prisma.student.count({
    where: {
      endDate: null,
      chapterId,
      OR: getOR(searchTerm),
    },
  });
}

export async function getMentorsWithStudentsAsync(
  chapterId: number,
  searchTerm: string | null,
  pageNumber: number,
  sortFullName: Prisma.SortOrder | undefined,
  sortCountMentors: Prisma.SortOrder | undefined,
  numberItems = 10,
) {
  return prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
      OR: getOR(searchTerm),
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
              frequencyInDays: true,
            },
          },
        },
      },
    },
    orderBy: {
      fullName: sortCountMentors ? undefined : (sortFullName ?? "asc"),
      mentorToStudentAssignement: sortCountMentors
        ? {
            _count: sortCountMentors,
          }
        : undefined,
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
