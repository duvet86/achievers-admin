import { SelectSearch } from "~/components";

interface Props {
  selectedStudentId: string | undefined;
  selectedMentorId: string | undefined;
  students: {
    id: number;
    fullName: string;
  }[];
  mentors: {
    id: number;
    fullName: string;
  }[];
  onFormClear: () => void;
  onStudentChange: (studentId: string) => void;
  onMentorIdChange: (mentorId: string) => void;
}

export function FormInputs({
  selectedStudentId,
  selectedMentorId,
  students,
  mentors,
  onFormClear,
  onStudentChange,
  onMentorIdChange,
}: Props) {
  return (
    <fieldset className="mb-6 flex flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SelectSearch
            label="Mentor"
            name="mentorId"
            defaultValue={selectedMentorId}
            options={mentors.map(({ id, fullName }) => ({
              label: fullName,
              value: id.toString(),
            }))}
            onChange={onMentorIdChange}
            showClearButton
          />
        </div>

        <div className="flex-1">
          <SelectSearch
            label="Student"
            name="studentId"
            defaultValue={selectedStudentId}
            options={students.map(({ id, fullName }) => ({
              label: fullName,
              value: id.toString(),
            }))}
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
