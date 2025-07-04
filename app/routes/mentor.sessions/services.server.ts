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

export async function getStudentsAsync(
  chapterId: number,
  loggedUserId: number,
  selectedMentorId: number | undefined,
) {
  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: loggedUserId,
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

  if (selectedMentorId !== undefined) {
    const assignedStudentsLookup = assignedStudents.reduce<
      Record<string, boolean>
    >((res, value) => {
      res[value.student.id] = true;

      return res;
    }, {});

    const students = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
      SELECT 
        s.id, s.fullName
      FROM Session sa
      INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN Student s ON s.id = ss.studentId
      WHERE sa.chapterId = ${chapterId} AND ms.mentorId = ${selectedMentorId}
      GROUP BY s.id, s.fullName
      ORDER BY s.fullName ASC`;

    return students.map(({ id, fullName }) => ({
      id,
      fullName: assignedStudentsLookup[id.toString()]
        ? `** ${fullName} (Assigned) **`
        : fullName,
    }));
  }

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
  loggedUserId: number,
  selectedStudentId: number | undefined,
) {
  const myStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: loggedUserId,
      student: {
        endDate: null,
      },
    },
    select: {
      studentId: true,
    },
  });

  const myPartners = await prisma.mentorToStudentAssignement.findMany({
    distinct: "userId",
    where: {
      user: {
        endDate: null,
      },
      studentId: {
        in: myStudents.map(({ studentId }) => studentId),
      },
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

  if (selectedStudentId !== undefined) {
    const myPartnersLookup = myPartners.reduce<Record<string, boolean>>(
      (res, value) => {
        res[value.user.id] = true;

        return res;
      },
      {},
    );

    const mentors = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
      SELECT 
        u.id, u.fullName
      FROM Session sa
      INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN User u ON u.id = ms.mentorId
      WHERE sa.chapterId = ${chapterId} AND ss.studentId = ${selectedStudentId}
      GROUP BY u.id, u.fullName
      ORDER BY u.fullName ASC`;

    return mentors.map(({ id, fullName }) => ({
      id,
      fullName:
        id === loggedUserId
          ? `** ${fullName} (Me) **`
          : myPartnersLookup[id.toString()]
            ? `** ${fullName} (Partner) **`
            : fullName,
    }));
  }

  const allMentors = await prisma.user.findMany({
    where: {
      chapterId,
      endDate: null,
      id: {
        notIn: myPartners.map(({ user: { id } }) => id),
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

  return myPartners
    .map(({ user: { id, fullName } }) => ({
      id,
      fullName:
        id === loggedUserId
          ? `** ${fullName} (Me) **`
          : `** ${fullName} (Partner) **`,
    }))
    .concat(allMentors);
}

export async function getCountAsync(
  chapterId: number,
  studentId: number | undefined,
  mentorId: number | undefined,
) {
  return await prisma.session.count({
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
  const sessions = await prisma.session.findMany({
    where: whereClause(chapterId, studentId, mentorId),
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      studentSession: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      mentorSession: {
        select: {
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
      attendedOn: "desc",
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
    chapterId,
    hasReport: true,
    mentorSession: {
      mentorId,
    },
    studentSession: {
      studentId,
    },
  };
}
