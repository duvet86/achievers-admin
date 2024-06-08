import dayjs from "dayjs";

import { prisma } from "~/db.server";

export async function getAssignedStudentsAsync(userId: number) {
  const students = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId,
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return students.map(({ student: { id, fullName } }) => ({
    id,
    fullName,
  }));
}

export async function getCountAsync(
  userId: number,
  studentId: number,
  startDate: Date | undefined,
  endDate: Date | undefined,
) {
  return await prisma.mentorToStudentSession.count({
    where: getWhereClause(userId, studentId, startDate, endDate),
  });
}

export async function getSessionsAsync(
  userId: number,
  studentId: number,
  startDate: Date | undefined,
  endDate: Date | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    select: {
      id: true,
      attendedOn: true,
      signedOffOn: true,
      completedOn: true,
    },
    where: getWhereClause(userId, studentId, startDate, endDate),
    orderBy: {
      attendedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function getWhereClause(
  userId: number,
  studentId: number,
  startDate: Date | undefined,
  endDate: Date | undefined,
) {
  return {
    userId,
    studentId,
    attendedOn: {
      lte: dayjs().add(1, "week").toDate(),
    },
    AND: [
      {
        attendedOn: {
          lte: endDate,
        },
      },
      {
        attendedOn: {
          gte: startDate,
        },
      },
    ],
  };
}
