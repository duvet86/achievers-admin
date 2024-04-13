export const searchAcrossFields = (
  searchTerm: string | null,
  cb: (search: string) => { [k: string]: { [l: string]: unknown } }[],
) => {
  if (searchTerm === null) {
    return [];
  }
  return searchTerm.trim().split(" ").flatMap(cb);
};
