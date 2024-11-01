import { data } from "@remix-run/react";

import { exportStudentsToSpreadsheetAsync } from "./services.server";

export async function loader() {
  const buf = await exportStudentsToSpreadsheetAsync();

  const resp = data(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": 'attachment; filename="SheetJSNode.xlsx"',
      "Content-Type": "application/vnd.ms-excel",
    }),
  });

  return resp;
}
