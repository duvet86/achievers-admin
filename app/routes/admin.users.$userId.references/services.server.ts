import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      references: {
        select: {
          id: true,
          fullName: true,
          isMentorRecommended: true,
        },
      },
    },
  });
}
