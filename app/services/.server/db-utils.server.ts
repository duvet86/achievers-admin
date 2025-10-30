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
    select: {
      id: true,
      label: true,
      startDate: true,
      endDate: true,
      year: true,
    },
    where: { year },
    orderBy: { startDate: "asc" },
  });

  return terms.map<Term>(({ id, label, year, startDate, endDate }) => {
    return {
      id,
      label,
      start: dayjs(startDate),
      end: dayjs(endDate),
      year,
    };
  });
}
