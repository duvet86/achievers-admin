import type { Chapter, MentoringMentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesInChapterAsync(chapterId: Chapter["id"]) {
  return await prisma.mentee.findMany({
    where: {
      chapterId: chapterId,
    },
  });
}

export async function assignMenteeToMentorAsync(
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

export async function getMenteesMentoredByAsync(
  mentorId: MentoringMentee["userId"]
) {
  return await prisma.mentoringMentee.findMany({
    where: {
      userId: mentorId,
      isActive: true,
    },
    orderBy: {
      startDate: "desc",
    },
    include: {
      Mentee: true,
    },
  });
}
