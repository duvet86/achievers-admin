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
  searchTerm?: string,
  chapterId?: number,
  allUsers = false,
) {
  return await prisma.user.count({
    where: {
      OR: allUsers
        ? undefined
        : [
            {
              welcomeCall: {
                is: null,
              },
            },
            {
              references: {
                some: {
                  calledOndate: {
                    equals: null,
                  },
                },
              },
            },
            {
              induction: {
                is: null,
              },
            },
            {
              policeCheck: {
                is: null,
              },
            },
            {
              wwcCheck: {
                is: null,
              },
            },
            {
              approvalbyMRC: {
                is: null,
              },
            },
          ],
      AND: [
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
            { email: { contains: searchTerm?.trim() } },
          ],
        },
        {
          userAtChapter: {
            some: {
              chapterId: chapterId,
            },
          },
        },
      ],
    },
  });
}

export async function getUsersAsync(
  pageNumber: number,
  searchTerm?: string,
  chapterId?: number,
  allUsers = false,
  numberItems = 10,
) {
  return await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      volunteerAgreementSignedOn: true,
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
      OR: allUsers
        ? undefined
        : [
            {
              welcomeCall: {
                is: null,
              },
            },
            {
              references: {
                some: {
                  calledOndate: {
                    equals: null,
                  },
                },
              },
            },
            {
              induction: {
                is: null,
              },
            },
            {
              policeCheck: {
                is: null,
              },
            },
            {
              wwcCheck: {
                is: null,
              },
            },
            {
              approvalbyMRC: {
                is: null,
              },
            },
          ],
      AND: [
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
            { email: { contains: searchTerm?.trim() } },
          ],
        },
        {
          userAtChapter: {
            some: {
              chapterId: chapterId,
            },
          },
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
