import type { Prisma } from "~/prisma/client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

export type SessionLookup = Record<
  string,
  | {
      id: number;
      status: string;
      attendedOn: Date;
      studentSession: {
        id: number;
        hasReport: boolean;
        isCancelled: boolean;
        student: {
          id: number;
          fullName: string;
        };
      }[];
    }
  | undefined
>;

export async function getMentorsAsync(
  chapterId: number,
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | undefined,
) {
  const mentors = await prisma.user.findMany({
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
      session: {
        select: {
          id: true,
          status: true,
          attendedOn: true,
          studentSession: {
            select: {
              id: true,
              hasReport: true,
              completedOn: true,
              isCancelled: true,
              student: {
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

  return mentors.map((mentor) => {
    const sessionLookup = mentor.session.reduce<SessionLookup>(
      (res, session) => {
        res[dayjs.utc(session.attendedOn).format("YYYY-MM-DD")] = session;

        return res;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { session, ...rest } = mentor;

    return {
      ...rest,
      sessionLookup,
    };
  });
}
