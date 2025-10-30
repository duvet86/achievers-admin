import type { Option } from "~/components";

import { SelectSearch } from "~/components";

interface Props {
  selectedStudentId: string | undefined;
  selectedMentorId: string | undefined;
  studentOptions: Option[];
  mentorOptions: Option[];
  selectedTermId: string;
  selectedTermYear: string;
  termYearsOptions: Option[];
  termsOptions: Option[];
  onFormClear: () => void;
  onStudentChange: (studentId: string) => void;
  onMentorIdChange: (mentorId: string) => void;
  onTermYearChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onTermIdChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function FormInputs({
  selectedStudentId,
  selectedMentorId,
  studentOptions,
  mentorOptions,
  selectedTermId,
  selectedTermYear,
  termYearsOptions,
  termsOptions,
  onFormClear,
  onStudentChange,
  onMentorIdChange,
  onTermYearChange,
  onTermIdChange,
}: Props) {
  return (
    <fieldset className="mb-6 flex flex-col gap-4">
      <div key={selectedTermId}>
        <label className="fieldset-label">Term</label>
        <div className="join w-full">
          <select
            className="select join-item basis-28"
            name="selectedTermYear"
            defaultValue={selectedTermYear}
            onChange={onTermYearChange}
          >
            {termYearsOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="select join-item w-full"
            name="selectedTermId"
            defaultValue={selectedTermId}
            onChange={onTermIdChange}
          >
            {termsOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SelectSearch
            label="Mentor"
            name="mentorId"
            defaultValue={selectedMentorId}
            options={mentorOptions}
            onChange={onMentorIdChange}
            showClearButton
          />
        </div>

        <div className="flex-1">
          <SelectSearch
            label="Student"
            name="studentId"
            defaultValue={selectedStudentId}
            options={studentOptions}
            onChange={onStudentChange}
            showClearButton
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="btn btn-neutral w-32"
          type="button"
          onClick={onFormClear}
        >
          Clear
        </button>
      </div>
    </fieldset>
  );
}
