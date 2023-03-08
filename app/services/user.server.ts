import type { User, Prisma, Chapter, UserAtChapter } from "@prisma/client";

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

export async function createManyUsersAsync(data: Prisma.UserCreateManyInput[]) {
  return await prisma.user.createMany({
    data,
  });
}

export async function getUserAtChapterByIdAsync(
  chapterId: UserAtChapter["chapterId"],
  userId: UserAtChapter["userId"]
) {
  return await prisma.userAtChapter.findUnique({
    where: {
      userId_chapterId: {
        chapterId,
        userId,
      },
    },
    include: {
      Chapter: true,
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
    include: {
      Chapter: true,
    },
  });
}

export async function getUsersAtChapterByIdAsync(chapterId: Chapter["id"]) {
  return await prisma.userAtChapter.findMany({
    where: {
      chapterId,
    },
  });
}

export async function getAssignedChapterToUsersLookUpAsync(
  userIds: User["id"][]
) {
  const userAtChapters = await prisma.userAtChapter.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
    include: {
      Chapter: true,
    },
  });

  const assignedChaptersLookUp = userAtChapters.reduce<
    Record<string, Chapter | null>
  >((res, userAtChapter) => {
    res[userAtChapter.userId] = userAtChapter.Chapter;

    return res;
  }, {});

  return assignedChaptersLookUp;
}

export async function assignChapterToUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"],
  assignedBy: UserAtChapter["assignedBy"]
) {
  await prisma.userAtChapter.create({
    data: {
      chapterId,
      userId,
      assignedBy,
    },
  });
}

export async function unassignChapterFromUserAsync(
  userId: UserAtChapter["userId"],
  chapterId: UserAtChapter["chapterId"]
) {
  await prisma.userAtChapter.delete({
    where: {
      userId_chapterId: {
        userId,
        chapterId,
      },
    },
  });
}
