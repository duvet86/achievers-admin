import type { AppAbility } from "~/services/.server";
import type { Prisma } from "~/prisma/client";

import { prisma } from "~/db.server";
import { calculateYearLevel } from "~/services";
import { accessibleBy } from "~/casl-prisma";

export async function getChaptersAsync(ability: AppAbility) {
  return await prisma.chapter.findMany({
    where: accessibleBy(ability).Chapter,
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStudentEoisCountAsync(
  ability: AppAbility,
  searchTerm: string | null,
  chapterId: number | null,
  includeApprovedStudents: boolean,
) {
  return await prisma.eoiStudentProfile.count({
    where: getWhereClause(
      ability,
      searchTerm,
      chapterId,
      includeApprovedStudents,
    ),
  });
}

export async function getStudentEoisAsync(
  ability: AppAbility,
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
  includeApprovedStudents: boolean,
  sortFullName: Prisma.SortOrder | undefined,
  sortChapter: Prisma.SortOrder | undefined,
  numberItems = 10,
) {
  const students = await prisma.eoiStudentProfile.findMany({
    select: {
      id: true,
      fullName: true,
      dateOfBirth: true,
      yearLevel: true,
      chapter: {
        select: {
          name: true,
        },
      },
      Student: {
        select: {
          id: true,
        },
      },
    },
    where: getWhereClause(
      ability,
      searchTerm,
      chapterId,
      includeApprovedStudents,
    ),
    orderBy: {
      fullName: sortChapter ? undefined : (sortFullName ?? "asc"),
      chapter: sortChapter
        ? {
            name: sortChapter,
          }
        : undefined,
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });

  return students.map((student) => ({
    ...student,
    yearLevel: student.yearLevel ?? calculateYearLevel(student.dateOfBirth),
  }));
}

function getWhereClause(
  ability: AppAbility,
  searchTerm: string | null,
  chapterId: number | null,
  includeApprovedStudents: boolean,
) {
  return {
    chapter: accessibleBy(ability).Chapter,
    AND: [
      includeApprovedStudents ? {} : { Student: null },
      chapterId !== null
        ? {
            chapterId: chapterId,
          }
        : {},
      {
        OR: [
          {
            fullName: {
              contains: searchTerm ?? undefined,
            },
          },
        ],
      },
    ],
  };
}
