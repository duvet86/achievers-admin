import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";

import { prisma } from "~/db.server";

export async function getTeacherByIdAsync(id: number) {
  return await prisma.studentTeacher.findUnique({
    where: {
      id,
    },
    select: {
      fullName: true,
      email: true,
      schoolName: true,
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

export async function createTeacherAsync(
  dataCreate: XOR<
    Prisma.StudentTeacherCreateInput,
    Prisma.StudentTeacherUncheckedCreateInput
  >,
) {
  return await prisma.studentTeacher.create({
    data: dataCreate,
  });
}
