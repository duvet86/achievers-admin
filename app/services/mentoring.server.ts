import type { MentoringMentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesMentoredByAsync(
  mentorId: MentoringMentee["userId"]
) {
  return await prisma.mentoringMentee.findMany({
    where: {
      userId: mentorId,
    },
    include: {
      Mentee: true,
    },
  });
}

export async function assignMenteeFromMentorAsync(
  userId: MentoringMentee["userId"],
  menteeId: MentoringMentee["menteeId"],
  chapterId: MentoringMentee["chapterId"],
  frequencyInDays: MentoringMentee["frequencyInDays"],
  startDate: MentoringMentee["startDate"],
  assignedBy: MentoringMentee["assignedBy"]
) {
  await prisma.mentoringMentee.create({
    data: {
      userId,
      menteeId,
      chapterId,
      frequencyInDays,
      startDate,
      assignedBy,
    },
  });
}

export async function unassignMenteeFromMentorAsync(
  userId: MentoringMentee["userId"],
  menteeId: MentoringMentee["menteeId"],
  chapterId: MentoringMentee["chapterId"]
) {
  await prisma.mentoringMentee.delete({
    where: {
      userId_menteeId_chapterId: {
        chapterId,
        userId,
        menteeId,
      },
    },
  });
}
