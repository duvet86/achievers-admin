import type { Prisma } from "~/prisma/client";

import { prisma } from "~/db.server";

export async function getStudentsCountAsync(
  chapterId: number,
  searchTerm: string | null,
) {
  return prisma.user.count({
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
  sortCountStudents: Prisma.SortOrder | undefined,
  numberItems = 10,
) {
  return prisma.user.findMany({
    where: {
      endDate: null,
      chapterId,
      OR: getOR(searchTerm),
    },
    select: {
      id: true,
      fullName: true,
      frequencyInDays: true,
      mentorToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      fullName: sortCountStudents ? undefined : (sortFullName ?? "asc"),
      mentorToStudentAssignement: sortCountStudents
        ? {
            _count: sortCountStudents,
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
