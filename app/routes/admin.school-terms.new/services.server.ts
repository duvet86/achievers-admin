import type { DateRange } from "~/services";

import { prisma } from "~/db.server";

export interface SchoolTermCommand extends DateRange {
  year: number;
  label: string;
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

export async function addTermsAsync(terms: SchoolTermCommand[]) {
  await prisma.schoolTerm.createMany({
    data: terms,
  });
}
