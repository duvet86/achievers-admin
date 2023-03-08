import type { Chapter, MentoringMentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesInChapterAsync(chapterId: Chapter["id"]) {
  return await prisma.mentee.findMany({
    where: {
      chapterId: chapterId,
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
