import { prisma } from "~/db.server";

export interface UpdateApprovalByMRCCommand {
  completedBy: string;
  submittedDate: Date | string;
  comment?: string | null;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      approvalbyMRC: true,
    },
  });
}

export async function updateApprovalByMRCAsync(
  userId: number,
  data: UpdateApprovalByMRCCommand,
) {
  return await prisma.approvalbyMRC.upsert({
    where: {
      userId,
    },
    create: {
      completedBy: data.completedBy,
      submittedDate: data.submittedDate,
      comment: data.comment,
      userId,
    },
    update: {
      completedBy: data.completedBy,
      submittedDate: data.submittedDate,
      comment: data.comment,
    },
  });
}
