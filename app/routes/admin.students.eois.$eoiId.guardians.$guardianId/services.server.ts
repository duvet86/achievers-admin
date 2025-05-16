import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";

import { prisma } from "~/db.server";

export async function getGuardianByIdAsync(id: number) {
  return await prisma.studentGuardian.findFirstOrThrow({
    where: {
      id,
    },
    select: {
      fullName: true,
      relationship: true,
      phone: true,
      email: true,
      address: true,
      eoiStudentProfile: {
        select: {
          fullName: true,
        },
      },
    },
  });
}

export async function updateGuardianByIdAsync(
  guardianId: number,
  dataUpdate: XOR<
    Prisma.StudentGuardianUpdateInput,
    Prisma.StudentGuardianUncheckedUpdateInput
  >,
) {
  return await prisma.studentGuardian.update({
    data: dataUpdate,
    where: {
      id: guardianId,
    },
  });
}
