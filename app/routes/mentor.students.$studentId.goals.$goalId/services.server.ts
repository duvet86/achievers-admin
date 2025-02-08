import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";

dayjs.extend(utc);

export interface GoalCommad {
  chapterId: number;
  mentorId: number;
  studentId: number;
  result: string | null;
  endDate: string;
  goal: string;
  title: string;
  isComplete: boolean;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getGoalById(id: number) {
  return await prisma.goal.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      goal: true,
      result: true,
      endDate: true,
      isAchieved: true,
    },
  });
}

export async function createGoalAsync(data: GoalCommad) {
  const { id } = await prisma.goal.create({
    data: {
      chapterId: data.chapterId,
      mentorId: data.mentorId,
      studentId: data.studentId,
      endDate: dayjs.utc(data.endDate, "YYYY-MM-DD").toDate(),
      goal: data.goal,
      title: data.title,
      isAchieved: false,
    },
    select: {
      id: true,
    },
  });

  return id;
}

export async function updateGoalByIdAsync(goalId: number, data: GoalCommad) {
  const { id } = await prisma.goal.update({
    where: {
      id: goalId,
    },
    data: {
      endDate: dayjs.utc(data.endDate, "YYYY-MM-DD").toDate(),
      goal: data.goal,
      title: data.title,
      isAchieved: data.isComplete,
    },
    select: {
      id: true,
    },
  });

  return id;
}
