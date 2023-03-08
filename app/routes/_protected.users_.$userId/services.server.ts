import type { Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function updateUserByIdAsync(
  id: string,
  data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
) {
  return await prisma.user.update({
    data,
    where: {
      id,
    },
  });
}
