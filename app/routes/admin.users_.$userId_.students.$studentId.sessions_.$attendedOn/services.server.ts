import { User } from "@prisma/client";

import { prisma } from "~/db.server";

interface SessionQuery {
  attendedOn: string;
  chapterId: number;
  studentId: number;
  userId: number;
}

export async function getUserAsync(userId: User["id"]) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}

export async function getSessionReportForStudentAsync({
  attendedOn,
  chapterId,
  studentId,
  userId,
}: SessionQuery) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    where: {
      userId_studentId_chapterId_attendedOn: {
        attendedOn,
        chapterId,
        studentId,
        userId,
      },
    },
    select: {
      attendedOn: true,
      report: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function saveReportAsync(
  { attendedOn, chapterId, studentId, userId }: SessionQuery,
  report: string,
) {
  return await prisma.mentorToStudentSession.update({
    where: {
      userId_studentId_chapterId_attendedOn: {
        attendedOn,
        chapterId,
        studentId,
        userId,
      },
    },
    data: {
      report,
    },
  });
}
