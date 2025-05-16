import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";

import { prisma } from "~/db.server";

export async function getTeacherByIdAsync(id: number) {
  return await prisma.studentTeacher.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      fullName: true,
      email: true,
      schoolName: true,
      eoiStudentProfile: {
        select: {
          fullName: true,
        },
      },
    },
  });
}

export async function updateTeacherByIdAsync(
  teacherId: number,
  dataUpdate: XOR<
    Prisma.StudentTeacherUpdateInput,
    Prisma.StudentTeacherUncheckedUpdateInput
  >,
) {
  return await prisma.studentTeacher.update({
    data: dataUpdate,
    where: {
      id: teacherId,
    },
  });
}
