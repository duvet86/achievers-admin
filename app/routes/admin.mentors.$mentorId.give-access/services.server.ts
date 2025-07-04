import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.mentor.findUniqueOrThrow({
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

export async function updateAzureIdAsync(mentorId: number, azureId: string) {
  return await prisma.mentor.update({
    where: {
      id: mentorId,
    },
    data: {
      azureADId: azureId,
      endDate: null,
    },
  });
}
