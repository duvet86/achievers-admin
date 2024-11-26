import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { isStringNullOrEmpty } from "~/services";

dayjs.extend(utc);

export interface Attendace {
  id: number;
  user: {
    id: number;
    fullName: string;
  };
}

export async function getMentorsForSession(
  chapterId: number,
  searchTerm: string | null,
) {
  return await prisma.user.findMany({
    where: {
      endDate: null,
      chapterId,
      fullName: isStringNullOrEmpty(searchTerm)
        ? undefined
        : {
            contains: searchTerm.trim(),
          },
    },
    orderBy: {
      fullName: "asc",
    },
    select: {
      id: true,
      fullName: true,
    },
  });
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

  return attendaces.reduce<Record<number, Attendace>>((result, attendace) => {
    result[attendace.user.id] = attendace;

    return result;
  }, {});
}

export async function attendSession(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  return await prisma.mentorAttendance.create({
    data: {
      chapterId,
      userId: mentorId,
      attendedOn,
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
