import type { Chapter } from "@prisma/client";

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

export async function getStudentsCountAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
) {
  return prisma.user.count({
    where: {
      chapterId,
      OR: getOR(searchTerm),
    },
  });
}

export async function getMentorsWithStudentsAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
  pageNumber: number,
  numberItems = 10,
) {
  return prisma.user.findMany({
    where: {
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
      mentorToStudentAssignement: {
        _count: "desc",
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
