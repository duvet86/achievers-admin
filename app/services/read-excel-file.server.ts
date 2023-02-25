import type { SpeadsheetUser } from "~/models/speadsheet";

import { Readable } from "stream";

import { stream, read, utils } from "xlsx";

export async function readExcelFileAsync(file: File) {
  stream.set_readable(Readable);

  const workbook = read(await file.arrayBuffer());
  const firstWs = workbook.Sheets[workbook.SheetNames[0]];

  const sheetUsers = utils.sheet_to_json<SpeadsheetUser>(firstWs);

  return sheetUsers;
}
