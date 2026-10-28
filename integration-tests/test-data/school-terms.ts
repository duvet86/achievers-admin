import type { PrismaClient } from "~/prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/client";

// Same terms as prisma/seed.ts, recreated so their ids are stable (2024 terms are 1 to 4).
const SCHOOL_TERMS = [
  { year: 2024, startDate: "2024-01-31", endDate: "2024-03-28" },
  { year: 2024, startDate: "2024-04-15", endDate: "2024-06-28" },
  { year: 2024, startDate: "2024-07-15", endDate: "2024-09-20" },
  { year: 2024, startDate: "2024-10-07", endDate: "2024-12-12" },
  { year: 2025, startDate: "2025-02-05", endDate: "2025-04-11" },
  { year: 2025, startDate: "2025-04-28", endDate: "2025-07-04" },
  { year: 2025, startDate: "2025-07-21", endDate: "2025-09-26" },
  { year: 2025, startDate: "2025-10-13", endDate: "2025-12-18" },
  { year: 2026, startDate: "2026-02-05", endDate: "2026-04-02" },
  { year: 2026, startDate: "2026-04-20", endDate: "2026-07-03" },
  { year: 2026, startDate: "2026-07-20", endDate: "2026-09-25" },
  { year: 2026, startDate: "2026-10-12", endDate: "2026-12-17" },
];

// Needs to run after createStudentsAsync, which deletes the student school reports.
export async function createSchoolTermsAsync(
  tx: Omit<
    PrismaClient<never, undefined, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
  >,
) {
  await tx.schoolTerm.deleteMany();
  await tx.$queryRaw`ALTER TABLE SchoolTerm AUTO_INCREMENT = 1;`;

  const termsPerYear: Record<number, number> = {};

  for (const { year, startDate, endDate } of SCHOOL_TERMS) {
    termsPerYear[year] = (termsPerYear[year] ?? 0) + 1;

    await tx.schoolTerm.create({
      data: {
        year,
        startDate: new Date(`${startDate}T00:00:00.000Z`),
        endDate: new Date(`${endDate}T00:00:00.000Z`),
        label: `Term ${termsPerYear[year]}`,
      },
    });
  }
}
