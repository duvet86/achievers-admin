import type { Chapter, Prisma } from "@prisma/client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

export type SessionLookup = Record<
  string,
  | {
      sessionId: number;
      studentSessionId: number;
      mentorId: number;
      mentorFullName: string;
      hasReport: boolean;
      completedOn: Date | null;
    }
  | undefined
>;

export async function getStudentsAsync(
  chapterId: Chapter["id"],
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | undefined,
) {
  const students = await prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
      fullName: searchTerm
        ? {
            contains: searchTerm,
          }
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
      studentSession: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          session: {
            select: {
              id: true,
              attendedOn: true,
              mentor: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      fullName: sortFullName ?? "asc",
    },
  });

  return students.map((student) => {
    const sessionLookup = student.studentSession.reduce<SessionLookup>(
      (res, studentSession) => {
        res[dayjs.utc(studentSession.session.attendedOn).format("YYYY-MM-DD")] =
          {
            sessionId: studentSession.session.id,
            studentSessionId: studentSession.id,
            mentorId: studentSession.session.mentor.id,
            mentorFullName: studentSession.session.mentor.fullName,
            hasReport: studentSession.hasReport,
            completedOn: studentSession.completedOn,
          };

        return res;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { studentSession, ...rest } = student;

    return {
      ...rest,
      sessionLookup,
    };
  });
}
