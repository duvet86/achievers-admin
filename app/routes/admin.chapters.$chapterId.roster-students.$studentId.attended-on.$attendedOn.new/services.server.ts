import type { SessionStatus } from "@prisma/client";

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
  return await prisma.studentSession.findFirst({
    where: {
      studentId,
      session: {
        chapterId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
    },
  });
}

export async function getSessionsByDateAsync(
  chapterId: number,
  attendedOn: string,
): Promise<SessionForDate[]> {
  return await prisma.session.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
    },
    select: {
      mentorId: true,
      status: true,
      studentSession: {
        select: {
          sessionId: true,
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
  sessionForDates: SessionForDate[],
) {
  const allMentors = await prisma.user.findMany({
    where: {
      chapterId,
      endDate: null,
    },
    select: {
      id: true,
      fullName: true,
      mentorToStudentAssignement: {
        where: {
          studentId: {
            not: studentId,
          },
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

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

  const unavailableMentorsLookup = sessionForDates.reduce<
    Record<string, boolean>
  >((res, { mentorId, status, studentSession }) => {
    res[mentorId.toString()] =
      studentSession.length > 0 || status === "UNAVAILABLE";

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
  return await prisma.session.create({
    data: {
      chapterId,
      mentorId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      studentSession: {
        create: {
          studentId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}
