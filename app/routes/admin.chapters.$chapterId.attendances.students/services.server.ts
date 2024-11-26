import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { isStringNullOrEmpty } from "~/services";

dayjs.extend(utc);

export async function getAttendancesAsync(
  chapterId: number,
  sessionDate: string,
  searchTerm: string | null,
) {
  return await prisma.studentAttendance.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
      student: isStringNullOrEmpty(searchTerm)
        ? undefined
        : {
            fullName: {
              contains: searchTerm.trim(),
            },
          },
    },
    select: {
      id: true,
      attendedOn: true,
      student: {
        select: {
          fullName: true,
        },
      },
      chapter: {
        select: {
          name: true,
        },
      },
    },
  });
}
