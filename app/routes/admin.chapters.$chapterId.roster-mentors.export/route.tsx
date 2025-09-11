import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getSchoolTermsAsync } from "~/services/.server";
import { getCurrentTermForDate, URLSafeSearch } from "~/services";

import { exportRosterToSpreadsheetAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const CURRENT_YEAR = dayjs().year();

  const url = new URLSafeSearch(request.url);

  const selectedTermYear =
    url.safeSearchParams.getNullOrEmpty("selectedTermYear") ??
    CURRENT_YEAR.toString();
  const selectedTermId = url.safeSearchParams.getNullOrEmpty("selectedTermId");

  const terms = await getSchoolTermsAsync();
  const currentTerm = getCurrentTermForDate(terms, new Date());

  const termsForYear = terms.filter(
    ({ year }) => year.toString() === selectedTermYear,
  );

  let selectedTerm = termsForYear.find(
    (t) => t.id.toString() === selectedTermId,
  );

  if (!selectedTerm) {
    if (selectedTermYear === CURRENT_YEAR.toString()) {
      selectedTerm = currentTerm;
    } else {
      selectedTerm = termsForYear[0];
    }
  }

  const buf = await exportRosterToSpreadsheetAsync(
    Number(params.chapterId),
    selectedTerm,
  );

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": `attachment; filename="roster_mentors ${selectedTerm.label} ${selectedTermYear}.xlsx"`,
      "Content-Type": "application/vnd.ms-excel",
    }),
  });
}
