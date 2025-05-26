import type { SessionStatus } from "~/prisma/client";

import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  chapterId: number;
  mentorId: number;
  studentId: number;
  attendedOn: string;
}

export interface SessionForDate {
  mentorId: number;
  status: SessionStatus;
  studentSession: {
    sessionId: number;
  }[];
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
      sessionAttendance: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function getChapterByIdAsync(id: number) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStudentByIdAsync(studentId: number) {
  return await prisma.student.findFirstOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getMentorsForStudentAsync(
  chapterId: number,
  studentId: number,
  attendedOn: string,
) {
  const allMentors = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
    SELECT id, fullName
    FROM User
    WHERE id NOT IN (
      SELECT userId FROM MentorToStudentAssignement
      WHERE studentId = ${studentId}
    ) AND chapterId = ${chapterId} AND endDate IS NULL
    ORDER BY fullName ASC`;

  const assignedMentors = await prisma.mentorToStudentAssignement.findMany({
    where: {
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

  const unavailableMentors = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: "UNAVAILABLE",
    },
    select: {
      mentorId: true,
    },
  });

  const unavailableMentorsLookup = unavailableMentors.reduce<
    Record<string, boolean>
  >((res, { mentorId }) => {
    res[mentorId.toString()] = true;

    return res;
  }, {});

  return assignedMentors
    .map(({ user: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allMentors)
    .map(({ id, fullName }) => {
      const isUnavailable = unavailableMentorsLookup[id] ?? false;

      return {
        label: fullName + (isUnavailable ? " (Unavailable)" : ""),
        value: id.toString(),
        isDisabled: isUnavailable,
      };
    });
}

export async function createSessionAsync({
  chapterId,
  mentorId,
  studentId,
  attendedOn,
}: SessionCommand) {
  let mentorSession = await prisma.mentorSession.findUnique({
    where: {
      chapterId_mentorId_attendedOn: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (mentorSession !== null && mentorSession.status !== "AVAILABLE") {
    throw new Error();
  }

  let studentSession = await prisma.studentSession.findUnique({
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
    },
  });

  if (studentSession !== null && studentSession.status !== "AVAILABLE") {
    throw new Error();
  }

  return await prisma.$transaction(async (tx) => {
    mentorSession ??= await tx.mentorSession.create({
      data: {
        chapterId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
        mentorId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    studentSession ??= await tx.studentSession.create({
      data: {
        chapterId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
        studentId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return await tx.sessionAttendance.create({
      data: {
        chapterId,
        mentorSessionId: mentorSession.id,
        studentSessionId: studentSession.id,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
      },
    });
  });
}
