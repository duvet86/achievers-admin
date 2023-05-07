import { prisma } from "~/db.server";

export async function getUsersCountAsync() {
  return await prisma.user.count();
}

export async function getUsersAsync(
  pageNumber: number,
  searchTerm?: string,
  numberItems = 10
) {
  return await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      userAtChapter: {
        select: {
          chapter: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    where:
      searchTerm !== undefined
        ? {
            OR: [
              {
                firstName: {
                  contains: searchTerm.trim(),
                },
              },
              {
                lastName: {
                  contains: searchTerm.trim(),
                },
              },
              { email: { contains: searchTerm.trim() } },
            ],
          }
        : undefined,
    orderBy: {
      firstName: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
