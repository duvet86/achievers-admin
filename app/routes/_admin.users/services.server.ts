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
                is: null,
              },
        },
        {
          references: allUsers
            ? undefined
            : {
                some: {
                  calledOndate: {
                    equals: undefined,
                  },
                },
              },
        },
        {
          induction: allUsers
            ? undefined
            : {
                is: null,
              },
        },
        {
          policeCheck: allUsers
            ? undefined
            : {
                is: null,
              },
        },
        {
          wwcCheck: allUsers
            ? undefined
            : {
                is: null,
              },
        },
        {
          approvalbyMRC: allUsers
            ? undefined
            : {
                is: null,
              },
        },
        {
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
