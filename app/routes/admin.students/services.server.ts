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
          OR: makeOrQueryFromSearchTerm(searchTerm),
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
          OR: makeOrQueryFromSearchTerm(searchTerm),
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

/**
 * split a search term at the spaces and generate
 * objects to be passed to a prisma query for firstName
 * lastName, and email for each of the new search terms
 * @param searchTerm the search term
 * @returns an array of prisma "where" objects
 */
function makeOrQueryFromSearchTerm(searchTerm: string | null) {
  return searchTerm
    ?.trim()
    ?.split(" ")
    ?.flatMap((x) => [
      {
        firstName: {
          contains: x?.trim(),
        },
      },
      {
        lastName: {
          contains: x?.trim(),
        },
      },
    ]);
}
