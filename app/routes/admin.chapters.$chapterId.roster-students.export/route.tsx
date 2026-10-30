import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getSchoolTermsAsync } from "~/services/.server";
import { getDatesForTerm, getSelectedTerm, URLSafeSearch } from "~/services";

import { exportRosterToSpreadsheetAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const CURRENT_YEAR = dayjs().year();

  const url = new URLSafeSearch(request.url);

  const selectedTermYear =
    url.safeSearchParams.getNullOrEmpty("selectedTermYear") ??
    CURRENT_YEAR.toString();
  const selectedTermId = url.safeSearchParams.getNullOrEmpty("selectedTermId");

  let selectedTermDate =
    url.safeSearchParams.getNullOrEmpty("selectedTermDate");
  const search = url.safeSearchParams.getNullOrEmpty("search");
  const sortFullName = url.safeSearchParams.getNullOrEmpty(
    "sortFullName",
  ) as Prisma.SortOrder | null;

  const terms = await getSchoolTermsAsync();
  const { selectedTerm } = getSelectedTerm(
    terms,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
  );

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);
  if (selectedTermDate && !sessionDates.includes(selectedTermDate)) {
    selectedTermDate = null;
  }

  const buf = await exportRosterToSpreadsheetAsync(
    Number(params.chapterId),
    selectedTerm,
    selectedTermDate,
    search,
    sortFullName ?? "asc",
  );

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": `attachment; filename="roster_students ${selectedTerm.label} ${selectedTermYear}.xlsx"`,
      "Content-Type": "application/vnd.ms-excel",
    }),
  });
}
