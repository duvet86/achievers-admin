import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface StudentSessionCommand {
  chapterId: number;
  studentId: number;
  attendedOn: string;
  reason: string;
}

export async function getStudentSessionByDateAsync(
  chapterId: number,
  studentId: number,
  attendedOn: string,
) {
  return await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
      reason: true,
    },
  });
}

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function createStudentSessionAsync({
  chapterId,
  studentId,
  attendedOn,
  reason,
}: StudentSessionCommand) {
  return await prisma.studentSession.create({
    data: {
      chapterId,
      studentId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: "UNAVAILABLE",
      reason,
    },
    select: {
      id: true,
    },
  });
}
