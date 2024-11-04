import { SelectSearch } from "~/components";

interface Props {
  selectedStudentId: string;
  selectedMentorId: string;
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

export default function FormInputs({
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
        <SelectSearch
          key={selectedStudentId}
          label="Student"
          name="studentId"
          defaultValue={selectedStudentId}
          options={students.map(({ id, fullName }) => ({
            label: fullName,
            value: id.toString(),
          }))}
          onChange={onStudentChange}
        />

        <SelectSearch
          key={selectedMentorId}
          label="Mentor"
          name="mentorId"
          defaultValue={selectedMentorId}
          options={mentors.map(({ id, fullName }) => ({
            label: fullName,
            value: id.toString(),
          }))}
          onChange={onMentorIdChange}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="btn btn-outline w-32"
          type="button"
          onClick={onFormClear}
        >
          Clear
        </button>
      </div>
    </fieldset>
  );
}