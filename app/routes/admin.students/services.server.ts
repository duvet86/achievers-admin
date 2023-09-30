import { prisma } from "~/db.server";

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
              studentAtChapter: {
                some: {
                  chapterId: chapterId,
                },
              },
            }
          : {},
        {
          OR: [
            {
              firstName: {
                contains: searchTerm?.trim(),
              },
            },
            {
              lastName: {
                contains: searchTerm?.trim(),
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
  return await prisma.student.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      yearLevel: true,
      endDate: true,
      studentAtChapter: {
        select: {
          chapter: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    where: {
      AND: [
        includeArchived ? {} : { endDate: null },
        chapterId !== null
          ? {
              studentAtChapter: {
                some: {
                  chapterId: chapterId,
                },
              },
            }
          : {},
        {
          OR: [
            {
              firstName: {
                contains: searchTerm?.trim(),
              },
            },
            {
              lastName: {
                contains: searchTerm?.trim(),
              },
            },
          ],
        },
      ],
    },
    orderBy: {
      firstName: "asc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
