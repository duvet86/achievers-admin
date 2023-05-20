import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      azureADId: true,
    },
  });
}

export async function archiveUserAsync(userId: number) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      endDate: new Date(),
      azureADId: null,
    },
  });
}
