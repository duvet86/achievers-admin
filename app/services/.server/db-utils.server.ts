export const searchAcrossFields = (
  searchTerm: string | null | undefined,
  cb: (search: string) => { [k: string]: { [l: string]: unknown } }[],
) => {
  return searchTerm?.trim().split(" ").flatMap(cb);
};
