import { prisma } from "~/db.server";

export async function getUsersAsync() {
  return await prisma.user.findMany({
    include: {
      chapter: true,
    },
  });
}
