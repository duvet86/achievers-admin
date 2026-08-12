import { prisma } from "~/db.server";

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      endDate: true,
      studentNotes: {
        select: {
          note: true,
        },
      },
    },
  });
}
