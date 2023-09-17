import { Input, Select } from "~/components";

interface Props {
  chapters: {
    id: number;
    name: string;
  }[];
  onFormSubmit: () => void;
}

export default function FormInputs({ chapters, onFormSubmit }: Props) {
  return (
    <div className="alert mb-6 flex flex-wrap justify-between">
      <div className="flex items-center gap-6">
        <div className="w-96">
          <Input name="searchTerm" placeholder="Search by name or email" />
        </div>

        <div className="w-44 max-w-xs">
          <Select
            name="chapterId"
            options={[{ value: "", label: "All chapters" }].concat(
              chapters.map(({ id, name }) => ({
                label: name,
                value: id.toString(),
              })),
            )}
          />
        </div>

        <div className="form-control">
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Include archived mentors</span>
            <input
              type="checkbox"
              name="allUsers"
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
          onClick={onFormSubmit}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
