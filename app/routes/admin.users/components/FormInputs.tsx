import { Input, Select } from "~/components";

interface Props {
  searchTerm: string | null;
  chapterId: string | null;
  onlyExpiredChecks: boolean;
  includeCompleteChecks: boolean;
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
  onIncludeCompleteChecksChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onIncludeArchivedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInputs({
  searchTerm,
  chapterId,
  onlyExpiredChecks,
  includeCompleteChecks,
  includeArchived,
  chapters,
  onFormReset,
  onChapterChange,
  onOnlyExpiredChecksChange,
  onIncludeCompleteChecksChange,
  onIncludeArchivedChange,
}: Props) {
  return (
    <fieldset className="mb-9 flex flex-wrap items-center gap-4">
      <div className="w-full sm:w-96">
        <Input
          label="Press enter to submit"
          name="searchTerm"
          placeholder="Search by name or email"
          defaultValue={searchTerm ?? ""}
        />
      </div>

      {chapters.length > 1 && (
        <div className="w-full sm:w-96">
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

      <div className="flex w-96 flex-col gap-4">
        <label className="fieldset-label">
          <input
            type="checkbox"
            name="onlyExpiredChecks"
            className="checkbox"
            defaultChecked={onlyExpiredChecks}
            onChange={onOnlyExpiredChecksChange}
          />
          <span className="label-text">
            Only expired or soon to expire checks
          </span>
        </label>

        <label className="fieldset-label">
          <input
            type="checkbox"
            name="includeCompleteChecks"
            className="checkbox"
            defaultChecked={includeCompleteChecks}
            onChange={onIncludeCompleteChecksChange}
          />
          <span className="label-text">Include complete checks</span>
        </label>

        <label className="fieldset-label">
          <input
            type="checkbox"
            name="includeArchived"
            className="checkbox"
            defaultChecked={includeArchived}
            onChange={onIncludeArchivedChange}
          />
          <span className="label-text">Include archived</span>
        </label>
      </div>

      <button
        className="btn btn-neutral btn-block sm:w-32"
        type="button"
        onClick={onFormReset}
      >
        Reset
      </button>
    </fieldset>
  );
}
