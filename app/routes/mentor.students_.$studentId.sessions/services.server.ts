import type { Chapter, Student, User } from "@prisma/client";
import dayjs from "dayjs";

import { prisma } from "~/db.server";

export async function getStudentAsync(studentId: Student["id"]) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

export async function getSessionsForStudentCountAsync(
  userId: User["id"],
  chapterId: Chapter["id"],
  studentId: Student["id"],
  startDate: Date | null,
  endDate: Date | null,
) {
  return await prisma.mentorToStudentSession.count({
    where: {
      chapterId,
      studentId,
      userId,
      attendedOn: {
        lte: dayjs().add(1, "week").toDate(),
      },
      AND: [
        {
          attendedOn: {
            lte: endDate ?? undefined,
          },
        },
        {
          attendedOn: {
            gte: startDate ?? undefined,
          },
        },
      ],
    },
    orderBy: {
      attendedOn: "desc",
    },
    take: 10,
  });
}

export async function getSessionsForStudentAsync(
  userId: User["id"],
  chapterId: Chapter["id"],
  studentId: Student["id"],
  startDate: Date | null,
  endDate: Date | null,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    select: {
      attendedOn: true,
      signedOffOn: true,
      completedOn: true,
    },
    where: {
      chapterId,
      studentId,
      userId,
      attendedOn: {
        lte: dayjs().add(1, "week").toDate(),
      },
      AND: [
        {
          attendedOn: {
            lte: endDate ?? undefined,
          },
        },
        {
          attendedOn: {
            gte: startDate ?? undefined,
          },
        },
      ],
    },
    orderBy: {
      attendedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
