import type { StudentTeacher } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getTeacherByIdAsync(id: number) {
  return await prisma.studentTeacher.findUnique({
    where: {
      id,
    },
    select: {
      fullName: true,
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function deleteTeacherByIdAsync(teacherId: StudentTeacher["id"]) {
  return await prisma.studentTeacher.delete({
    where: {
      id: teacherId,
    },
  });
}
