import { Input, Select } from "~/components";

interface Props {
  chapters: {
    id: number;
    name: string;
  }[];
  searchParams: URLSearchParams;
  onFormClear: () => void;
}

export default function FormInputs({
  chapters,
  searchParams,
  onFormClear,
}: Props) {
  const searchTerm = searchParams.get("searchTerm");

  return (
    <div className="mb-6 hidden flex-wrap justify-between lg:flex">
      <div className="flex items-center gap-6">
        <div className="w-96">
          <Input
            name="searchTerm"
            placeholder="Search by name"
            defaultValue={
              searchParams.get("clearSearchBtn") === null && searchTerm !== null
                ? searchTerm
                : ""
            }
          />
        </div>

        {chapters.length > 1 && (
          <div className="w-44 max-w-xs">
            <Select
              name="chapterId"
              defaultValue={searchParams.get("chapterId") ?? ""}
              options={[{ value: "", label: "All chapters" }].concat(
                chapters.map(({ id, name }) => ({
                  label: name,
                  value: id.toString(),
                })),
              )}
            />
          </div>
        )}

        <div className="form-control">
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Include archived students</span>
            <input
              type="checkbox"
              name="includeArchived"
              className="checkbox bg-base-100"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          className="btn btn-primary w-32"
          type="submit"
          name="searchBtn"
          value="searchBtn"
        >
          Submit
        </button>
        <button
          className="btn btn-outline w-32"
          type="submit"
          name="clearSearchBtn"
          value="clearSearchBtn"
          onClick={onFormClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
