import { prisma } from "~/db.server";

export async function getStudentAsync(studentId: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
      endDate: null,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}
