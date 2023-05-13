import { prisma } from "~/db.server";

export async function getUsersCountAsync() {
  return await prisma.user.count();
}

export async function getUsersAsync(
  pageNumber: number,
  searchTerm?: string,
  allUsers = false,
  numberItems = 10
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
      OR: [
        {
          welcomeCall: allUsers
            ? undefined
            : {
                calledOnDate: {
                  equals: undefined,
                },
              },
          references: allUsers
            ? undefined
            : {
                some: {
                  calledOndate: {
                    equals: undefined,
                  },
                },
              },
          induction: allUsers
            ? undefined
            : {
                completedOnDate: {
                  equals: undefined,
                },
              },
          policeCheck: allUsers
            ? undefined
            : {
                createdAt: {
                  equals: undefined,
                },
              },
          wwcCheck: allUsers
            ? undefined
            : {
                createdAt: {
                  equals: undefined,
                },
              },
          approvalbyMRC: allUsers
            ? undefined
            : {
                completedBy: {
                  equals: undefined,
                },
              },
          firstName: {
            contains: searchTerm?.trim(),
          },
          lastName: {
            contains: searchTerm?.trim(),
          },
          email: { contains: searchTerm?.trim() },
        },
      ],
    },
    orderBy: {
      firstName: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
