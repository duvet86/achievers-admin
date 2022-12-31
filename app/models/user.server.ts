import type { MentoringStudent, UserAtChapter } from "@prisma/client";
import type { AzureUser } from "~/models/azure.server";

import { prisma } from "~/db.server";

export interface AssignStudentToMentor {
  mentorId: AzureUser["id"];
  studentIds: MentoringStudent["studentId"][];
  chapterId: MentoringStudent["chapterId"];
}

export interface AssignUserToChapters {
  userId: AzureUser["id"];
  chapterIds: UserAtChapter["chapterId"][];
}

export async function getStudentsMentoredByAsync(mentorId: AzureUser["id"]) {
  return await prisma.mentoringStudent.findMany({
    where: {
      mentorId,
    },
  });
}

export async function assignUserToChaptersAsync(
  { userId, chapterIds }: AssignUserToChapters,
  assignedBy: string
) {
  await prisma.userAtChapter.createMany({
    data: chapterIds.map((chapterId) => ({
      userId,
      chapterId,
      assignedBy,
    })),
  });
}

export async function assignStudentToMentorAsync(
  { mentorId, chapterId, studentIds }: AssignStudentToMentor,
  assignedBy: string
) {
  await prisma.mentoringStudent.createMany({
    data: studentIds.map((studentId) => ({
      mentorId,
      studentId,
      chapterId,
      assignedBy,
    })),
  });
}
