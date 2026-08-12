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

export async function archiveStudentAsync(
  studentId: number,
  endReason: string,
) {
  return await prisma.$transaction(async (tx) => {
    await tx.studentNote.create({
      data: {
        note: endReason,
        studentId,
      },
    });

    return await tx.student.update({
      where: {
        id: studentId,
      },
      data: {
        endDate: new Date(),
      },
    });
  });
}
