import type { Chapter, User } from "@prisma/client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

import { prisma } from "~/db.server";

dayjs.extend(isBetween);

export async function getNextSessionAsync(userId: User["id"]) {
  const nextAvailableSession = await prisma.mentorToStudentSession.findFirst({
    where: {
      userId,
      attendedOn: {
        gte: new Date(),
      },
    },
    select: {
      attendedOn: true,
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return nextAvailableSession;
}

export async function getSessionsAsync(
  userId: User["id"],
  chapterId: Chapter["id"],
) {
  return prisma.mentorToStudentSession.findMany({
    select: {
      attendedOn: true,
      studentId: true,
      hasReport: true,
      signedOffOn: true,
    },
    where: {
      chapterId,
      userId,
    },
    orderBy: {
      attendedOn: "desc",
    },
    take: 5,
  });
}
