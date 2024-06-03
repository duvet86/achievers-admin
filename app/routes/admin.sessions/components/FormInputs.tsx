import type { SubmitFunction } from "@remix-run/react";

import { useSearchParams } from "@remix-run/react";

import { DateInput, Select, SelectSearch } from "~/components";

interface Props {
  selectedChapterId: string;
  selectedMentorId: string | undefined;
  selectedStudentId: string | undefined;
  mentors: {
    id: number;
    fullName: string;
  }[];
  students: {
    id: number;
    fullName: string;
  }[];
  chapters: {
    id: number;
    name: string;
  }[];
  onFormClear: (e: React.MouseEvent<HTMLButtonElement>) => void;
  submit: SubmitFunction;
}

export default function FormInputs({
  selectedChapterId,
  selectedMentorId,
  selectedStudentId,
  chapters,
  mentors,
  students,
  onFormClear,
  submit,
}: Props) {
  const [searchParams] = useSearchParams();

  const isNotClearForm = searchParams.get("clearSearchBtn") === null;

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const isCompleted = searchParams.get("isCompleted");
  const isSignedOff = searchParams.get("isSignedOff");

  return (
    <div className="mb-6 hidden flex-col gap-4 lg:flex">
      <Select
        label="Select a chpater"
        name="chapterId"
        defaultValue={selectedChapterId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          submit(e.currentTarget.form)
        }
        options={chapters.map(({ id, name }) => ({
          label: name,
          value: id.toString(),
        }))}
      />
      <div className="flex flex-1 gap-4">
        <SelectSearch
          key={`${selectedChapterId}-mentorId`}
          label="Mentor"
          name="mentorId"
          defaultValue={selectedMentorId}
          options={mentors.map(({ id, fullName }) => ({
            label: fullName,
            value: id.toString(),
          }))}
        />

        <SelectSearch
          key={`${selectedChapterId}-studentId`}
          label="Student"
          name="studentId"
          defaultValue={selectedStudentId}
          options={students.map(({ id, fullName }) => ({
            label: fullName,
            value: id.toString(),
          }))}
        />
      </div>

      <div className="flex flex-1 gap-4">
        <DateInput
          defaultValue={isNotClearForm && startDate !== null ? startDate : ""}
          label="Start date"
          name="startDate"
        />

        <DateInput
          defaultValue={isNotClearForm && endDate !== null ? endDate : ""}
          label="End date"
          name="endDate"
        />
      </div>

      <div className="flex">
        <div className="flex flex-1 gap-8">
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                name="isCompleted"
                className="checkbox bg-base-100"
                defaultChecked={
                  isNotClearForm && isCompleted !== null
                    ? isCompleted === "on"
                    : false
                }
              />
              <span className="label-text">Only completed</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                name="isSignedOff"
                className="checkbox bg-base-100"
                defaultChecked={
                  isNotClearForm && isSignedOff !== null
                    ? isSignedOff === "on"
                    : false
                }
              />
              <span className="label-text">Only signed off</span>
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
            name="clearSearchBtn"
            value="clearSearchBtn"
            onClick={onFormClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
