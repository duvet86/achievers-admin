import type { Student, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getUserAsync(userId: User["id"]) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

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

export async function getSessionsAsync(
  userId: User["id"],
  studentId: Student["id"],
) {
  return prisma.mentorToStudentSession.findMany({
    select: {
      attendedOn: true,
      hasReport: true,
      signedOffOn: true,
    },
    where: {
      studentId,
      userId,
    },
    orderBy: {
      attendedOn: "desc",
    },
    take: 10,
  });
}
