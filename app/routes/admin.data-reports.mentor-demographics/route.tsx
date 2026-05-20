import { exportMentorsToSpreadsheetAsync } from "../admin.mentors.export/services.server";

export async function loader() {
  const buf = await exportMentorsToSpreadsheetAsync();

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": 'attachment; filename="mentor-demographics.xlsx"',
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  });
}
