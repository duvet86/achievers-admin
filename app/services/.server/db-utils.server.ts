import type { Term } from "~/models";

import dayjs from "dayjs";

import { prisma } from "~/db.server";

export const searchAcrossFields = (
  searchTerm: string | null | undefined,
  cb: (search: string) => Record<string, Record<string, unknown>>[],
) => {
  return searchTerm?.trim().split(" ").flatMap(cb);
};

export async function getSchoolTermsAsync(year?: number): Promise<Term[]> {
  const terms = await prisma.schoolTerm.findMany({
    where: {
      year,
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return terms.map<Term>(({ id, startDate, endDate }, index) => ({
    id,
    name: "Term " + (index + 1),
    start: dayjs(startDate),
    end: dayjs(endDate),
  }));
}
