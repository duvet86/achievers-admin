import type { Prisma, User, UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function updateUserByIdAsync(
  userId: User["id"],
  dataCreate: Prisma.XOR<
    Prisma.UserCreateInput,
    Prisma.UserUncheckedCreateInput
  >,
  dataUpdate: Prisma.XOR<
    Prisma.UserUpdateInput,
    Prisma.UserUncheckedUpdateInput
  >
) {
  return await prisma.user.upsert({
    create: dataCreate,
    update: dataUpdate,
    where: {
      id: userId,
    },
  });
}

export async function getUserAtChaptersByIdAsync(
  userId: UserAtChapter["userId"]
) {
  return await prisma.userAtChapter.findMany({
    where: {
      userId,
    },
    select: {
      Chapter: true,
    },
  });
}
