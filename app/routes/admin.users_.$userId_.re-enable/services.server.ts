import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

export async function updateEndDateAsync(userId: number) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      endDate: null,
    },
  });
}
