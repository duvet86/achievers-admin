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

export async function getStudentsCountAsync(
  ability: AppAbility,
  searchTerm: string | null,
  chapterId: number | null,
  includeArchived = false,
) {
  return await prisma.student.count({
    where: {
      chapter: accessibleBy(ability).Chapter,
      AND: [
        includeArchived ? {} : { endDate: null },
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
    },
  });
}

export async function getStudentsAsync(
  ability: AppAbility,
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
  sortFullName: Prisma.SortOrder | undefined,
  sortChapter: Prisma.SortOrder | undefined,
  includeArchived = false,
  numberItems = 10,
) {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
      endDate: true,
      dateOfBirth: true,
      yearLevel: true,
      chapter: {
        select: {
          name: true,
        },
      },
    },
    where: {
      chapter: accessibleBy(ability).Chapter,
      AND: [
        includeArchived ? {} : { endDate: null },
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
    },
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

  return students.map((student) => {
    let yearLevel = student.yearLevel;
    let isYearLevelCalculated = false;
    if (!yearLevel) {
      yearLevel = calculateYearLevel(student.dateOfBirth);
      isYearLevelCalculated = true;
    }

    return {
      ...student,
      yearLevel: yearLevel
        ? `${yearLevel}${isYearLevelCalculated ? " *" : ""}`
        : "N/A",
    };
  });
}
