import type { Term } from "~/models";

import dayjs from "dayjs";

import { prisma } from "~/db.server";

export const searchAcrossFields = (
  searchTerm: string | null | undefined,
  cb: (search: string) => Record<string, Record<string, unknown>>[],
) => {
  return searchTerm?.trim().split(" ").flatMap(cb);
};

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
