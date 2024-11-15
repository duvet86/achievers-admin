import type { LoaderFunctionArgs } from "@remix-run/node";

import invariant from "tiny-invariant";

import { exportRosterToSpreadsheetAsync } from "./services.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);

  const buf = await exportRosterToSpreadsheetAsync(
    Number(params.chapterId),
    url.searchParams.get("selectedTerm"),
    url.searchParams.get("selectedTermDate"),
  );

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": 'attachment; filename="roster.xlsx"',
      "Content-Type": "application/vnd.ms-excel",
    }),
  });
}
