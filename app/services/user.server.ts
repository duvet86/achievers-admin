import type { User, Prisma, Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      Chapter: true,
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

export async function createManyUsersAsync(data: Prisma.UserCreateManyInput[]) {
  return await prisma.user.createMany({
    data,
  });
}

export async function getUsersAtChapterByIdAsync(chapterId: Chapter["id"]) {
  return await prisma.user.findMany({
    where: {
      chapterId,
    },
  });
}

export async function getAssignedChapterToUsersLookUpAsync(
  userIds: User["id"][]
) {
  const userWithChapter = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    include: {
      Chapter: true,
    },
  });

  const assignedChaptersLookUp = userWithChapter.reduce<
    Record<string, Chapter | null>
  >((res, user) => {
    res[user.id] = user.Chapter;

    return res;
  }, {});

  return assignedChaptersLookUp;
}

export async function assignChapterToUserAsync(
  userId: User["id"],
  chapterId: User["chapterId"]
) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      chapterId,
    },
  });
}

export async function unassignChapterFromUserAsync(userId: User["id"]) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      chapterId: null,
    },
  });
}
