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

export async function updateEndDateAsync(studentId: number) {
  return await prisma.student.update({
    where: {
      id: studentId,
    },
    data: {
      endDate: null,
    },
  });
}
