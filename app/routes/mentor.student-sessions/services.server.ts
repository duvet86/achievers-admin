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
  const sessionUsers = await prisma.session.findMany({
    distinct: "mentorId",
    where: {
      chapterId,
      studentSession: {
        some: {
          studentId,
        },
      },
    },
    select: {
      mentor: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      mentor: {
        fullName: "asc",
      },
    },
  });

  return sessionUsers.map(({ mentor: { id, fullName } }) => ({
    id,
    fullName,
  }));
}

export async function getCountAsync(
  chapterId: number,
  studentId: number | undefined,
  mentorId: number | undefined,
) {
  return await prisma.studentSession.count({
    where: whereClause(chapterId, studentId, mentorId),
  });
}

export async function getStudentSessionsAsync(
  chapterId: number,
  studentId: number | undefined,
  mentorId: number | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  const sessions = await prisma.studentSession.findMany({
    where: {
      studentId,
      session: {
        chapterId,
        mentorId,
      },
    },
    select: {
      id: true,
      completedOn: true,
      signedOffOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: {
        attendedOn: "desc",
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });

  return sessions;
}

function whereClause(
  chapterId: number,
  studentId: number | undefined,
  mentorId: number | undefined,
) {
  return {
    studentId,
    session: {
      chapterId,
      mentorId,
    },
  };
}
