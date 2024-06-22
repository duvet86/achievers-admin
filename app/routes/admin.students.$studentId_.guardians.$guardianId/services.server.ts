import type { Prisma, StudentGuardian } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getGuardianByIdAsync(id: number) {
  return await prisma.studentGuardian.findUnique({
    where: {
      id,
    },
    select: {
      fullName: true,
      relationship: true,
      phone: true,
      email: true,
      address: true,
    },
  });
}

export async function updateGuardianByIdAsync(
  guardianId: StudentGuardian["id"],
  dataUpdate: Prisma.XOR<
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

export async function createGuardianAsync(
  dataCreate: Prisma.XOR<
    Prisma.StudentGuardianCreateInput,
    Prisma.StudentGuardianUncheckedCreateInput
  >,
) {
  return await prisma.studentGuardian.create({
    data: dataCreate,
  });
}
