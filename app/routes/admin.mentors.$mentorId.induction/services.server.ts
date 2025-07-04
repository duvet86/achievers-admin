import { prisma } from "~/db.server";

export interface UpdateInductionCommand {
  runBy: string;
  completedOnDate: Date | string;
  comment?: string | null;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      induction: true,
    },
  });
}

export async function updateInductionAsync(
  mentorId: number,
  data: UpdateInductionCommand,
) {
  return await prisma.induction.upsert({
    where: {
      mentorId,
    },
    create: {
      completedOnDate: data.completedOnDate,
      runBy: data.runBy,
      comment: data.comment,
      mentorId,
    },
    update: {
      completedOnDate: data.completedOnDate,
      runBy: data.runBy,
      comment: data.comment,
    },
  });
}
