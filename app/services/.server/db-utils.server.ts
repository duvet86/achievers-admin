export const searchAcrossFields = (
  searchTerm: string | null,
  cb: (search: string) => { [k: string]: { [l: string]: unknown } }[],
) => {
  return searchTerm?.trim().split(" ").flatMap(cb);
};
