import type { Chapter, User } from "@prisma/client";

import { prisma } from "~/db.server";

export interface UpdateUser {
  id: User["id"];
  chapterIds: Chapter["id"][];
}

export interface CreateUser {
  email: User["email"];
  azureObjectId: User["azureObjectId"];
}

export async function getUsersAsync() {
  return prisma.user.findMany({
    include: {
      chapters: {
        include: {
          chapter: true,
        },
      },
    },
  });
}

export async function getUserByIdAsync(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      chapters: {
        include: {
          chapter: true,
        },
      },
    },
  });
}

export async function getUserByEmailAsync(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getOrCreateUserAsync(
  email: User["email"],
  azureObjectId: User["azureObjectId"]
) {
  const user = await getUserByEmailAsync(email);
  if (user !== null) {
    return user;
  }

  return prisma.user.create({
    data: {
      email,
      azureObjectId,
    },
  });
}

export async function updateAsync(user: UpdateUser) {
  await prisma.userAtChapter.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      chapters: {
        connectOrCreate: user.chapterIds.map((chapterId) => ({
          create: {
            chapterId: chapterId,
            assignedBy: user.id,
          },
          where: {
            userId_chapterId: {
              chapterId: chapterId,
              userId: user.id,
            },
          },
        })),
      },
    },
  });
}

export async function createManyUsers(users: CreateUser[]) {
  await prisma.user.createMany({
    data: users,
  });
}
