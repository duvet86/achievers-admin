import { write, utils } from "xlsx";

export function addCollectionToSpreadsheet(collection: unknown[]) {
    const wb = utils.book_new();
  
    utils.book_append_sheet(
      wb,
      utils.json_to_sheet(collection),
    );
  
    const buf = write(wb, { type: "buffer", bookType: "xlsx" }) as ReadableStream;
  
    return buf;
}
