import type { Chapter, Student, User } from "@prisma/client";

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

export async function getSessionsForStudentAsync(
  userId: User["id"],
  chapterId: Chapter["id"],
  studentId: Student["id"],
) {
  return prisma.mentorToStudentSession.findMany({
    select: {
      attendedOn: true,
      hasReport: true,
      signedOffOn: true,
    },
    where: {
      chapterId,
      studentId,
      userId,
    },
    orderBy: {
      attendedOn: "desc",
    },
    take: 10,
  });
}
