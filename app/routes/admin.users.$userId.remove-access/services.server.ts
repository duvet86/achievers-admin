import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      azureADId: true,
    },
  });
}

export async function updateAzureIdAsync(userId: number, azureId: string) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      azureADId: azureId,
      endDate: null,
    },
  });
}

export async function removeUserAccessAsync(userId: number) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      azureADId: null,
    },
  });
}
