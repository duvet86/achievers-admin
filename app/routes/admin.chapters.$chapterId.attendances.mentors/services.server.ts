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
  return await prisma.mentorAttendance.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
      mentor: isStringNullOrEmpty(searchTerm)
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
      mentor: {
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
