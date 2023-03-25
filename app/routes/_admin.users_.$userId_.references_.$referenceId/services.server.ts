import { prisma } from "~/db.server";

export async function getUserWithReferenceByIdAsync(
  userId: number,
  referenceId: number
) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      lastName: true,
      references: {
        where: {
          id: referenceId,
        },
      },
    },
  });
}
