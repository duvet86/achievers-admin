import type { DateRange } from "~/services";

import { prisma } from "~/db.server";

export interface SchoolTerm extends DateRange {
  id: number;
}

export async function getAvailableYearsAsync() {
  const years = await prisma.schoolTerm.findMany({
    distinct: ["year"],
    select: {
      year: true,
    },
  });

  return years.map(({ year }) => year.toString());
}

export async function getSchoolTermsForYearAsync(year: number) {
  return await prisma.schoolTerm.findMany({
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
}

export async function editTermsAsync(terms: SchoolTerm[]) {
  const updates = terms.map((term) =>
    prisma.schoolTerm.update({
      where: {
        id: term.id,
      },
      data: term,
    }),
  );

  await prisma.$transaction(updates);
}
