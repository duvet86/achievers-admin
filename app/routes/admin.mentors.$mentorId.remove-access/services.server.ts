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

export async function updateAzureIdAsync(mentorId: number, azureADId: string) {
  await prisma.mentor.update({
    where: {
      id: mentorId,
    },
    data: {
      azureADId,
    },
  });
}

export async function removeUserAccessAsync(mentorId: number) {
  await prisma.mentor.update({
    where: {
      id: mentorId,
    },
    data: {
      azureADId: null,
    },
  });
}
