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

export function getClosestSessionDate(dates: Date[]) {
  if (dates.length === 0) {
    throw new Error();
  }

  const today = new Date();
  const closest = dates.reduce((a, b) =>
    a.getDate() - today.getDate() < b.getDate() - today.getDate() ? a : b,
  );

  return dayjs(closest).format("YYYY-MM-DD") + "T00:00:00Z";
}

export async function getMentorsForSession(
  chapterId: number,
  sessionDate: string,
  searchTerm: string | null,
) {
  const sessions = await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
      user: isStringNullOrEmpty(searchTerm)
        ? undefined
        : {
            fullName: {
              contains: searchTerm.trim(),
            },
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

  return sessions.map(({ user }) => user);
}

export async function getMentorAttendancesLookup(
  chapterId: number,
  sessionDate: string,
  searchTerm: string | null,
) {
  const attendaces = await prisma.mentorAttendance.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
      user: isStringNullOrEmpty(searchTerm)
        ? undefined
        : {
            fullName: {
              contains: searchTerm.trim(),
            },
          },
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
  attendedOn: string | null,
) {
  return await prisma.mentorAttendance.create({
    data: {
      chapterId,
      userId: mentorId,
      attendedOn: attendedOn
        ? dayjs.utc(attendedOn, "YYYY-MM-DD").toDate()
        : dayjs().format("YYYY-MM-DD") + "T00:00:00Z",
    },
  });
}

export async function removeAttendace(attendanceId: number) {
  return await prisma.mentorAttendance.delete({
    where: {
      id: attendanceId,
    },
  });
}
