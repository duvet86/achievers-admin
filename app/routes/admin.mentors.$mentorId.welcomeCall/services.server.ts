import { prisma } from "~/db.server";

export interface UpdateWelcomeCallCommand {
  calledBy: string;
  calledOnDate: Date | string;
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
      welcomeCall: true,
    },
  });
}

export async function updateWelcomeCallAsync(
  mentorId: number,
  data: UpdateWelcomeCallCommand,
) {
  return await prisma.welcomeCall.upsert({
    where: {
      mentorId,
    },
    create: {
      calledBy: data.calledBy,
      calledOnDate: data.calledOnDate,
      comment: data.comment,
      mentorId,
    },
    update: {
      calledBy: data.calledBy,
      calledOnDate: data.calledOnDate,
      comment: data.comment,
    },
  });
}
