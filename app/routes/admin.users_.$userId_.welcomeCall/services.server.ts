import { prisma } from "~/db.server";

export interface UpdateWelcomeCallCommand {
  calledBy: string;
  calledOnDate: Date | string;
  comment?: string | null;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
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
  userId: number,
  data: UpdateWelcomeCallCommand,
) {
  return await prisma.welcomeCall.upsert({
    where: {
      userId,
    },
    create: {
      calledBy: data.calledBy,
      calledOnDate: data.calledOnDate,
      comment: data.comment,
      userId,
    },
    update: {
      calledBy: data.calledBy,
      calledOnDate: data.calledOnDate,
      comment: data.comment,
    },
  });
}
