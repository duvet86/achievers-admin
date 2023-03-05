import type { User, MentoringMentee, Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export interface AssignStudentToMentor {
  mentorId: User["id"];
  menteeeId: MentoringMentee["menteeId"];
  chapterId: MentoringMentee["chapterId"];
}

export async function getUserByIdAsync(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      Chapter: true,
    },
  });
}

export async function updateUserByIdAsync(
  id: string,
  data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
) {
  return await prisma.user.update({
    data,
    where: {
      id,
    },
  });
}

export async function createManyUsersAsync(data: Prisma.UserCreateManyInput[]) {
  return await prisma.user.createMany({
    data,
  });
}

export async function getMenteesMentoredByAsync(mentorId: User["id"]) {
  return await prisma.mentoringMentee.findMany({
    where: {
      userId: mentorId,
    },
    include: {
      Mentee: true,
    },
  });
}

export async function assignChapterToUserAsync(
  userId: User["id"],
  chapterId: User["chapterId"]
) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      chapterId,
    },
  });
}

export async function unassignChapterFromUserAsync(userId: User["id"]) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      chapterId: null,
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
