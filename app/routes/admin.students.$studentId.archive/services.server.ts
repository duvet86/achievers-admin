import type { Student } from "@prisma/client/index.js";

import { prisma } from "~/db.server";

export async function getStudentByIdAsync(id: Student["id"]) {
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

export async function archiveStudentAsync(id: Student["id"]) {
  return await prisma.student.update({
    where: {
      id,
    },
    data: {
      endDate: new Date(),
    },
  });
}
