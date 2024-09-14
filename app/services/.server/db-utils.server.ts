export const searchAcrossFields = (
  searchTerm: string | null | undefined,
  cb: (search: string) => Record<string, Record<string, unknown>>[],
) => {
  return searchTerm?.trim().split(" ").flatMap(cb);
};
