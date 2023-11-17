import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUsersCountAsync(
  searchTerm: string | null,
  chapterId: number | null,
  includeArchived = false,
) {
  return await prisma.user.count({
    where: {
      AND: [
        includeArchived ? {} : { endDate: null },
        chapterId !== null
          ? {
              userAtChapter: {
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

export async function getUsersAsync(
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
  includeArchived = false,
  numberItems = 10,
) {
  return await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      volunteerAgreementSignedOn: true,
      endDate: true,
      userAtChapter: {
        select: {
          chapter: {
            select: {
              name: true,
            },
          },
        },
      },
      approvalbyMRC: {
        select: {
          submittedDate: true,
        },
      },
      induction: {
        select: {
          completedOnDate: true,
        },
      },
      policeCheck: {
        select: {
          createdAt: true,
        },
      },
      references: {
        select: {
          calledOndate: true,
        },
      },
      welcomeCall: {
        select: {
          calledOnDate: true,
        },
      },
      wwcCheck: {
        select: {
          createdAt: true,
        },
      },
    },
    where: {
      AND: [
        includeArchived ? {} : { endDate: null },
        chapterId !== null
          ? {
              userAtChapter: {
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

export function getNumberCompletedChecks(user: any): number {
  let checks = 1;
  if (user.welcomeCall !== null) {
    checks++;
  }
  if (
    user.references.filter((ref: any) => ref.calledOndate !== null).length >= 2
  ) {
    checks++;
  }
  if (user.induction !== null) {
    checks++;
  }
  if (user.policeCheck !== null) {
    checks++;
  }
  if (user.wwcCheck !== null) {
    checks++;
  }
  if (user.approvalbyMRC !== null) {
    checks++;
  }
  if (user.volunteerAgreementSignedOn !== null) {
    checks++;
  }

  return checks;
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
      { email: { contains: x?.trim() } },
    ]);
}
