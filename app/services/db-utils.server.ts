export const searchAcrossFields = (
  searchTerm: string | null,
  cb: (search: string) => { [k: string]: { [l: string]: typeof search } }[],
) => {
  return searchTerm?.trim()?.split(" ")?.flatMap(cb);
};
