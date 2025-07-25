import { Input, Select } from "~/components";

interface Props {
  searchTerm: string | null;
  chapterId: string | null;
  includeArchived: boolean;
  chapters: {
    id: number;
    name: string;
  }[];
  onFormClear: () => void;
  onChapterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onIncludeArchivedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormInputs({
  searchTerm,
  chapterId,
  includeArchived,
  chapters,
  onFormClear,
  onChapterChange,
  onIncludeArchivedChange,
}: Props) {
  return (
    <fieldset className="mb-6 flex flex-wrap justify-between gap-4">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="w-full sm:w-96">
          <Input
            label="Press enter to submit"
            name="searchTerm"
            placeholder="Search by name"
            defaultValue={searchTerm ?? ""}
          />
        </div>

        {chapters.length > 1 && (
          <div className="w-full sm:w-44">
            <Select
              label="Chapters"
              name="chapterId"
              defaultValue={chapterId ?? ""}
              options={[{ value: "", label: "All chapters" }].concat(
                chapters.map(({ id, name }) => ({
                  label: name,
                  value: id.toString(),
                })),
              )}
              onChange={onChapterChange}
            />
          </div>
        )}

        <label className="label cursor-pointer gap-2">
          <input
            type="checkbox"
            name="includeArchived"
            className="checkbox bg-base-100"
            defaultChecked={includeArchived}
            onChange={onIncludeArchivedChange}
          />
          <span className="label-text">Include archived students</span>
        </label>
      </div>

      <div className="flex items-end">
        <button
          className="btn btn-neutral w-full sm:w-32"
          type="button"
          onClick={onFormClear}
        >
          Reset
        </button>
      </div>
    </fieldset>
  );
}
