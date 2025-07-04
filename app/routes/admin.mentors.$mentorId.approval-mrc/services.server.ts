import dayjs from "dayjs";

import { prisma } from "~/db.server";

export interface UpdateApprovalByMRCCommand {
  completedBy: string;
  submittedDate: Date | string;
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
      approvalbyMRC: true,
    },
  });
}

export async function updateApprovalByMRCAsync(
  mentorId: number,
  data: UpdateApprovalByMRCCommand,
) {
  const submittedDate = dayjs(data.submittedDate).toDate();

  return await prisma.approvalbyMRC.upsert({
    where: {
      mentorId,
    },
    create: {
      completedBy: data.completedBy,
      submittedDate,
      comment: data.comment,
      mentorId,
    },
    update: {
      completedBy: data.completedBy,
      submittedDate,
      comment: data.comment,
    },
  });
}
