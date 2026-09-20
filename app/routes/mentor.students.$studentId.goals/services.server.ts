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
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId,
      endDate: null,
    },
    select: {
      id: true,
    },
  });
}

export async function getGoalsForStudent(
  volunteerId: number,
  studentId: number,
) {
  return await prisma.goal.findMany({
    where: {
      volunteerId,
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
