import type { User, MentoringStudent, UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export interface AssignStudentToMentor {
  mentorId: User["id"];
  menteeeId: MentoringStudent["menteeId"];
  chapterId: MentoringStudent["chapterId"];
}

export async function getMenteesMentoredByAsync(mentorId: User["id"]) {
  return await prisma.mentoringStudent.findMany({
    where: {
      mentor: {
        id: mentorId,
      },
    },
  });
}

export async function assignChapterToUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"],
  assignedBy: UserAtChapter["assignedBy"]
) {
  await prisma.userAtChapter.create({
    data: {
      assignedBy,
      userId,
      chapterId,
    },
  });
}

export async function unassignChapterFromUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"]
) {
  await prisma.userAtChapter.delete({
    where: {
      userId_chapterId: {
        chapterId,
        userId,
      },
    },
  });
}

export async function assignMenteeFromMentorAsync(
  userId: MentoringStudent["userId"],
  menteeId: MentoringStudent["menteeId"],
  chapterId: MentoringStudent["chapterId"],
  frequencyInDays: MentoringStudent["frequencyInDays"],
  startDate: MentoringStudent["startDate"],
  assignedBy: MentoringStudent["assignedBy"]
) {
  await prisma.mentoringStudent.create({
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
  userId: MentoringStudent["userId"],
  menteeId: MentoringStudent["menteeId"],
  chapterId: MentoringStudent["chapterId"]
) {
  await prisma.mentoringStudent.delete({
    where: {
      userId_menteeId_chapterId: {
        chapterId,
        userId,
        menteeId,
      },
    },
  });
}
