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
) {
  return await prisma.mentorToStudentSession.count({
    where: {
      chapterId,
      completedOn: {
        not: null,
      },
      signedOffOn: null,
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
    },
  });
}

export async function getReportsAsync(
  chapterId: Chapter["id"],
  searchTerm: string | null,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      completedOn: {
        not: null,
      },
      signedOffOn: null,
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
    },
    select: {
      attendedOn: true,
      completedOn: true,
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
