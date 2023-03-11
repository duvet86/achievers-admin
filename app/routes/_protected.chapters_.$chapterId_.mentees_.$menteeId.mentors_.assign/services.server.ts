import type { Mentee, MentoringMentee, UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getgMenteeByIdAsync(menteeId: Mentee["id"]) {
  return await prisma.mentee.findUniqueOrThrow({
    select: {
      firstName: true,
      lastName: true,
    },
    where: {
      id: menteeId,
    },
  });
}

export async function getMentorsMentoringMenteeAtChapterAsync(
  chapterId: MentoringMentee["chapterId"],
  menteeId: MentoringMentee["menteeId"]
) {
  return await prisma.mentoringMentee.findMany({
    where: {
      chapterId,
      menteeId,
    },
  });
}

export async function getMentorsAtChapterAsync(
  chapterId: UserAtChapter["chapterId"]
) {
  return await prisma.userAtChapter.findMany({
    select: {
      userId: true,
    },
    where: {
      chapterId,
    },
  });
}

export async function assignMentorToMenteeAsync(
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
