import type { Prisma, StudentTeacher } from "@prisma/client/index.js";

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
  teacherId: StudentTeacher["id"],
  dataUpdate: Prisma.XOR<
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
  dataCreate: Prisma.XOR<
    Prisma.StudentTeacherCreateInput,
    Prisma.StudentTeacherUncheckedCreateInput
  >,
) {
  return await prisma.studentTeacher.create({
    data: dataCreate,
  });
}
