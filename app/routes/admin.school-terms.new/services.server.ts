import type { DateRange } from "~/services";

import { prisma } from "~/db.server";

export interface NewSchoolTerm extends DateRange {
  year: number;
}

export async function getExisitingYearsAsync() {
  const years = await prisma.schoolTerm.findMany({
    distinct: ["year"],
    select: {
      year: true,
    },
  });

  return years.map(({ year }) => year);
}

export async function addTermsAsync(terms: NewSchoolTerm[]) {
  await prisma.schoolTerm.createMany({
    data: terms,
  });
}
