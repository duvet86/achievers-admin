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
    select: { id: true, startDate: true, endDate: true, year: true },
    where: { year },
    orderBy: { startDate: "asc" },
  });

  let index = 1;
  let yearTemp = 0;

  return terms.map<Term>(({ id, year, startDate, endDate }) => {
    if (yearTemp !== year) {
      index = 1;
      yearTemp = year;
    } else {
      index++;
    }

    return {
      id,
      name: `Term ${index}`,
      start: dayjs(startDate),
      end: dayjs(endDate),
      year,
    };
  });
}
