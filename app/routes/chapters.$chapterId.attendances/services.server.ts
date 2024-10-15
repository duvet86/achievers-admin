import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { isStringNullOrEmpty } from "~/services";

dayjs.extend(utc);

export async function getSchoolTermsForYearAsync(
  year: number,
): Promise<Term[]> {
  const terms = await prisma.schoolTerm.findMany({
    where: {
      year,
    },
    select: {
      startDate: true,
      endDate: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return terms.map<Term>(({ startDate, endDate }, index) => ({
    name: "Term " + (index + 1),
    start: dayjs(startDate),
    end: dayjs(endDate),
  }));
}

export function getCurrentTermForDate(terms: Term[], date: Date): Term {
  for (let i = 0; i < terms.length; i++) {
    if (
      dayjs(date).isBetween(terms[i].start, terms[i].end, "day", "[]") ||
      (terms[i - 1] &&
        dayjs(date).isBetween(terms[i - 1].end, terms[i].start, "day", "[]"))
    ) {
      return terms[i];
    }
  }

  return terms[0];
}

export async function getMentorsForSession(
  chapterId: number,
  sessionDate: string,
  searchTerm: string | null,
) {
  if (!isStringNullOrEmpty(searchTerm)) {
    const mentors = await prisma.user.findMany({
      where: {
        chapterId,
        fullName: {
          contains: searchTerm.trim(),
        },
      },
    });

    return mentors.map((mentor) => ({
      ...mentor,
      student: null,
    }));
  }

  const sessions = await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
    },
    select: {
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
    orderBy: {
      user: {
        fullName: "asc",
      },
    },
  });

  return sessions.map(({ user, student }) => ({
    ...user,
    student,
  }));
}

export async function getMentorAttendancesLookup(
  chapterId: number,
  sessionDate: string,
) {
  const attendaces = await prisma.mentorAttendance.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return attendaces.reduce<
    Record<
      number,
      {
        id: number;
        user: {
          id: number;
          fullName: string;
        };
      }
    >
  >((result, attendace) => {
    result[attendace.user.id] = attendace;

    return result;
  }, {});
}

export async function attendSession(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.mentorToStudentSession.count({
      where: {
        chapterId,
        attendedOn,
        userId: mentorId,
      },
    });

    if (session === 0) {
      await tx.mentorToStudentSession.create({
        data: {
          attendedOn,
          chapterId,
          userId: mentorId,
        },
      });
    }

    return await tx.mentorAttendance.create({
      data: {
        chapterId,
        userId: mentorId,
        attendedOn,
      },
    });
  });
}

export async function removeAttendace(attendanceId: number) {
  return await prisma.mentorAttendance.delete({
    where: {
      id: attendanceId,
    },
  });
}
