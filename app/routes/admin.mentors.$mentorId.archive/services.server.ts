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

export async function archiveUserAsync(mentorId: number, endReason: string) {
  return await prisma.$transaction(async (tx) => {
    await tx.mentorToStudentAssignement.deleteMany({
      where: {
        mentorId,
      },
    });

    await tx.mentorNote.create({
      data: {
        note: endReason,
        mentorId,
      },
    });

    return await tx.mentor.update({
      where: {
        id: mentorId,
      },
      data: {
        azureADId: null,
        endDate: new Date(),
        status: "ARCHIVED",
      },
    });
  });
}
