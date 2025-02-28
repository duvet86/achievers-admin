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

export async function archiveUserAsync(userId: number, endReason: string) {
  return await prisma.$transaction(async (tx) => {
    await tx.mentorToStudentAssignement.deleteMany({
      where: {
        userId,
      },
    });

    return await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        azureADId: null,
        endDate: new Date(),
        endReason,
      },
    });
  });
}
