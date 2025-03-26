import type { Option } from "~/components";

import { useNavigate, useSearchParams } from "react-router";

import { Select, SelectSearch } from "~/components";

interface Props {
  chapterId: string;
  selectedTermId: string;
  selectedTermYear: string;
  selectedTermDate: string | undefined;
  mentorId: string | undefined;
  studentId: string | undefined;
  isSignedOff: boolean;
  chaptersOptions: Option[];
  mentorsOptions: Option[];
  studentsOptions: Option[];
  termYearsOptions: Option[];
  termsOptions: Option[];
  sessionDatesOptions: Option[];
}

export default function FormInputs({
  chapterId,
  selectedTermId,
  selectedTermYear,
  selectedTermDate,
  mentorId,
  studentId,
  isSignedOff,
  chaptersOptions,
  mentorsOptions,
  studentsOptions,
  termYearsOptions,
  termsOptions,
  sessionDatesOptions,
}: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onFormClear = () => {
    searchParams.set("chapterId", "");
    searchParams.set("mentorId", "");
    searchParams.set("studentId", "");
    searchParams.set("selectedTermYear", "");
    searchParams.set("selectedTermId", "");
    searchParams.set("selectedTermDate", "");
    searchParams.set("isSignedOff", "");
    searchParams.set("pageNumber", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("chapterId", e.target.value);

    searchParams.set("mentorId", "");
    searchParams.set("studentId", "");
    searchParams.set("selectedTermYear", "");
    searchParams.set("selectedTermId", "");
    searchParams.set("selectedTermDate", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onTermYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTermYear", e.target.value);

    searchParams.set("mentorId", "");
    searchParams.set("studentId", "");
    searchParams.set("selectedTermId", "");
    searchParams.set("selectedTermDate", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onTermIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTermId", e.target.value);

    searchParams.set("mentorId", "");
    searchParams.set("studentId", "");
    searchParams.set("selectedTermDate", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onTermDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTermDate", e.target.value);

    searchParams.set("mentorId", "");
    searchParams.set("studentId", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onMentorIdChange = (value: string) => {
    searchParams.set("mentorId", value);

    searchParams.set("studentId", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onStudentIdChange = (value: string) => {
    searchParams.set("studentId", value);

    searchParams.set("mentorId", "");

    void navigate(`?${searchParams.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-col gap-4">
      {chaptersOptions.length > 1 && (
        <div>
          <Select
            label="Select a Chapter"
            name="chapterId"
            defaultValue={chapterId}
            options={chaptersOptions}
            onChange={onChapterChange}
          />
        </div>
      )}

      <div key={chapterId} className="w-full">
        <label className="fieldset-label">Term</label>
        <div className="join w-full">
          <select
            data-testid="selectedTermYear"
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
            data-testid="selectedTermId"
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

      <div key={`${chapterId}-${selectedTermId}`} className="w-full">
        <Select
          label="Session date"
          name="selectedTermDate"
          defaultValue={selectedTermDate}
          options={sessionDatesOptions}
          onChange={onTermDateChange}
        />
      </div>

      <div
        key={`${chapterId}-${selectedTermId}-${selectedTermDate}`}
        className="flex flex-1 flex-col gap-4 sm:flex-row"
      >
        <div className="w-full">
          <SelectSearch
            label="Mentor"
            name="mentorId"
            defaultValue={mentorId}
            options={mentorsOptions}
            onChange={onMentorIdChange}
          />
        </div>

        <div className="w-full">
          <SelectSearch
            label="Student"
            name="studentId"
            defaultValue={studentId}
            options={studentsOptions}
            onChange={onStudentIdChange}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="mb-2 flex flex-1 gap-8">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              name="isSignedOff"
              className="checkbox bg-base-100"
              defaultChecked={isSignedOff}
            />
            <span className="label-text">Only signed off</span>
          </label>
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
      </div>
    </div>
  );
}
