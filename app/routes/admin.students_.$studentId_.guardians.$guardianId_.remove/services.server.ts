import type { StudentGuardian } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getGuardianByIdAsync(id: number) {
  return await prisma.studentGuardian.findUnique({
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

export async function deleteGuardianByIdAsync(
  guardianId: StudentGuardian["id"],
) {
  return await prisma.studentGuardian.delete({
    where: {
      id: guardianId,
    },
  });
}
