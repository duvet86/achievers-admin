import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserByIdAsync(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmailAsync(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getOrCreateUserAsync(email: User["email"]) {
  const user = await getUserByEmailAsync(email);
  if (user !== null) {
    return user;
  }

  return prisma.user.create({
    data: {
      email,
    },
  });
}

export async function deleteUserByEmailAsync(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
