import type { MentoringStudent, UserAtChapter } from "@prisma/client";
import type { AzureUser } from "~/models/azure.server";

import { prisma } from "~/db.server";

export interface AssignStudentToMentor {
  mentorId: AzureUser["id"];
  studentId: MentoringStudent["studentId"];
  chapterId: MentoringStudent["chapterId"];
}

export async function getStudentsMentoredByAsync(mentorId: AzureUser["id"]) {
  return await prisma.mentoringStudent.findMany({
    where: {
      mentorId,
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
  mentorId: MentoringStudent["mentorId"],
  studentId: MentoringStudent["studentId"],
  chapterId: MentoringStudent["chapterId"],
  frequencyInDays: MentoringStudent["frequencyInDays"],
  assignedBy: MentoringStudent["assignedBy"]
) {
  await prisma.mentoringStudent.create({
    data: {
      mentorId,
      studentId,
      chapterId,
      frequencyInDays,
      assignedBy,
    },
  });
}

export async function unassignMenteeFromMentorAsync(
  mentorId: MentoringStudent["mentorId"],
  studentId: MentoringStudent["studentId"],
  chapterId: MentoringStudent["chapterId"]
) {
  await prisma.mentoringStudent.delete({
    where: {
      mentorId_studentId_chapterId: {
        chapterId,
        mentorId,
        studentId,
      },
    },
  });
}
