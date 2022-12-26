import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export interface UpdateUser {
  id: string;
  role: string;
  chapterIds: string[];
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

export async function updateAsync(user: UpdateUser) {
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      userRels: {
        set: [],
      },
      chapters: {
        set: [],
      },
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      chapters: {
        // set: user.chapterIds.map((chapterId) => ({
        //   userId_chapterId: {
        //     chapterId: chapterId,
        //     userId: user.id,
        //   },
        // })),
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
