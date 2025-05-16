import type { Route } from "./+types/route";

import invariant from "tiny-invariant";

import { exportRosterToSpreadsheetAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);

  const selectedTermDate = url.searchParams.get("selectedTermDate");

  const buf = await exportRosterToSpreadsheetAsync(
    Number(params.chapterId),
    url.searchParams.get("selectedTerm"),
    selectedTermDate,
  );

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": `attachment; filename="roster_mentors_${selectedTermDate ?? ""}.xlsx"`,
      "Content-Type": "application/vnd.ms-excel",
    }),
  });
}
