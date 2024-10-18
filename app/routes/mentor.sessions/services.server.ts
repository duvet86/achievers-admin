import { prisma } from "~/db.server";

export async function getUserAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}

export async function getStudentsAsync(chapterId: number, mentorId: number) {
  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentorId,
      student: {
        endDate: null,
      },
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      user: {
        fullName: "asc",
      },
    },
  });

  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      id: {
        notIn: assignedStudents.map(({ student: { id } }) => id),
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents);
}

export async function getMentorsAsync(
  chapterId: number,
  studentId: number | undefined,
) {
  const sessionUsers = await prisma.mentorToStudentSession.findMany({
    distinct: "userId",
    where: {
      chapterId,
      studentId,
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      user: {
        fullName: "asc",
      },
    },
  });

  return sessionUsers.map(({ user: { id, fullName } }) => ({
    id,
    fullName,
  }));
}

export async function getCountAsync(
  chapterId: number,
  studentId: number | undefined,
  mentorId: number | undefined,
) {
  return await prisma.mentorToStudentSession.count({
    where: whereClause(chapterId, studentId, mentorId),
  });
}

export async function getSessionsAsync(
  chapterId: number,
  studentId: number | undefined,
  mentorId: number | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: whereClause(chapterId, studentId, mentorId),
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: { attendedOn: "desc" },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  chapterId: number,
  studentId: number | undefined,
  userId: number | undefined,
) {
  return {
    studentId,
    userId,
    chapterId,
  };
}
