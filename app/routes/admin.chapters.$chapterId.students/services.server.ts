import type { Prisma } from "~/prisma/client";

import { prisma } from "~/db.server";

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
          mentor: {
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
