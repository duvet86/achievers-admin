import { exportStudentsToSpreadsheetAsync } from "./services.server";

export async function loader() {
  const buf = await exportStudentsToSpreadsheetAsync();

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": 'attachment; filename="SheetJSNode.xlsx"',
      "Content-Type": "application/vnd.ms-excel",
    }),
  });
}
