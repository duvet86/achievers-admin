import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";
import { searchAcrossFields } from "~/services";

export async function getMentorsWithStudentsCountAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
) {
  return prisma.student.count({
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
  return prisma.student.findMany({
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
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              frequencyInDays: true,
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
