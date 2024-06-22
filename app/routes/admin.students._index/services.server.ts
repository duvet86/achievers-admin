import { prisma } from "~/db.server";
import { calculateYearLevel } from "~/services";

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStudentsCountAsync(
  searchTerm: string | null,
  chapterId: number | null,
  includeArchived = false,
) {
  return await prisma.student.count({
    where: {
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
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
  includeArchived = false,
  numberItems = 10,
) {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
      endDate: true,
      dateOfBirth: true,
      chapter: {
        select: {
          name: true,
        },
      },
    },
    where: {
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
      fullName: "asc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });

  return students.map((student) => ({
    ...student,
    yearLevel: calculateYearLevel(student.dateOfBirth),
  }));
}
