import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { isStringNullOrEmpty } from "~/services";

dayjs.extend(utc);

export async function getMentorsForSession(
  chapterId: number,
  sessionDate: string | null,
  searchTerm: string | null,
) {
  const sessions = await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn: sessionDate
        ? dayjs.utc(sessionDate, "YYYY-MM-DD").toDate()
        : new Date(),
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
  sessionDate: string | null,
  searchTerm: string | null,
) {
  const attendaces = await prisma.mentorAttendance.findMany({
    where: {
      chapterId,
      attendedOn: sessionDate
        ? dayjs.utc(sessionDate, "YYYY-MM-DD").toDate()
        : new Date(),
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
