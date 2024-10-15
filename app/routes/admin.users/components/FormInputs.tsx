import { Input, Select } from "~/components";

interface Props {
  searchTerm: string | null;
  chapterId: string | null;
  onlyExpiredChecks: boolean;
  includeArchived: boolean;
  chapters: {
    id: number;
    name: string;
  }[];
  onFormReset: () => void;
  onChapterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onOnlyExpiredChecksChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onIncludeArchivedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInputs({
  searchTerm,
  chapterId,
  onlyExpiredChecks,
  includeArchived,
  chapters,
  onFormReset,
  onChapterChange,
  onOnlyExpiredChecksChange,
  onIncludeArchivedChange,
}: Props) {
  return (
    <fieldset className="mb-6 flex flex-wrap justify-between gap-4">
      <div className="flex flex-col items-end gap-6 sm:flex-row">
        <div className="w-full sm:w-96">
          <Input
            key={searchTerm}
            label="Press enter to submit"
            name="searchTerm"
            placeholder="Search by name or email"
            defaultValue={searchTerm ?? ""}
          />
        </div>

        {chapters.length > 1 && (
          <div className="w-full sm:w-44">
            <Select
              key={chapterId}
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

        <div className="flex flex-wrap sm:gap-4">
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                key={onlyExpiredChecks.toString()}
                type="checkbox"
                name="onlyExpiredChecks"
                className="checkbox bg-base-100"
                defaultChecked={onlyExpiredChecks}
                onChange={onOnlyExpiredChecksChange}
              />
              <span className="label-text">
                Only expired or soon to expire checks
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                key={includeArchived.toString()}
                type="checkbox"
                name="includeArchived"
                className="checkbox bg-base-100"
                defaultChecked={includeArchived}
                onChange={onIncludeArchivedChange}
              />
              <span className="label-text">Include archived</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-end">
        <button
          className="btn btn-outline sm:w-32"
          type="button"
          onClick={onFormReset}
        >
          Reset
        </button>
      </div>
    </fieldset>
  );
}
