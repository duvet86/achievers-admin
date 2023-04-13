import { prisma } from "~/db.server";

export async function getUsersAsync() {
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
  });
}
