import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { isStringNullOrEmpty } from "~/services";

dayjs.extend(utc);

export interface Attendance {
  id: number;
  student: {
    id: number;
    fullName: string;
  };
}

export async function getStudentsForSession(
  chapterId: number,
  searchTerm: string | null,
) {
  return await prisma.student.findMany({
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

export async function getStudentAttendancesLookup(
  chapterId: number,
  sessionDate: string,
) {
  const attendaces = await prisma.studentAttendance.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return attendaces.reduce<Record<number, Attendance>>((result, attendace) => {
    result[attendace.student.id] = attendace;

    return result;
  }, {});
}

export async function attendSession(
  chapterId: number,
  studentId: number,
  attendedOn: string,
) {
  return await prisma.studentAttendance.create({
    data: {
      chapterId,
      studentId,
      attendedOn,
    },
  });
}

export async function removeAttendace(attendanceId: number) {
  return await prisma.studentAttendance.delete({
    where: {
      id: attendanceId,
    },
  });
}
