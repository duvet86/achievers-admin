import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";
import { searchAcrossFields } from "~/services";

export async function getStudentsCountAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
) {
  return prisma.user.count({
    where: {
      chapterId,
      OR: searchAcrossFields(
        searchTerm,
        (searchTerm: string) =>
          [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
          ] as const,
      ),
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
      OR: searchAcrossFields(
        searchTerm,
        (searchTerm: string) =>
          [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
          ] as const,
      ),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      frequencyInDays: true,
      mentorToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
