import { useSearchParams } from "@remix-run/react";

import { DateInput, Select } from "~/components";

interface Props {
  selectedStudentId: string | undefined;
  students: {
    id: number;
    fullName: string;
  }[];
  onFormClear: () => void;
}

export default function FormInputs({
  selectedStudentId,
  students,
  onFormClear,
}: Props) {
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  return (
    <div className="mb-6 hidden flex-wrap items-end justify-between gap-4 lg:flex">
      <Select
        label="Select a student"
        name="studentId"
        defaultValue={selectedStudentId}
        options={students.map(({ id, fullName }) => ({
          label: fullName,
          value: id.toString(),
        }))}
      />

      <div className="flex flex-1 gap-4">
        <DateInput
          defaultValue={
            searchParams.get("clearSearchBtn") === null && startDate !== null
              ? startDate
              : ""
          }
          label="Start date"
          name="startDate"
        />

        <DateInput
          defaultValue={
            searchParams.get("clearSearchBtn") === null && endDate !== null
              ? endDate
              : ""
          }
          label="End date"
          name="endDate"
        />
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
