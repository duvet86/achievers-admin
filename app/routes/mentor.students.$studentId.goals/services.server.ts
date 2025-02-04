import { prisma } from "~/db.server";

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

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
    },
  });
}

export async function getGoalsForStudent(mentorId: number, studentId: number) {
  return await prisma.goal.findMany({
    where: {
      mentorId,
      studentId,
    },
    select: {
      id: true,
      title: true,
      endDate: true,
      isAchieved: true,
    },
  });
}
