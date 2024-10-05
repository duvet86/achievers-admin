import { Input } from "~/components";

interface Props {
  searchParams: URLSearchParams;
  onFormClear: () => void;
}

export default function FormInputs({ searchParams, onFormClear }: Props) {
  const searchTerm = searchParams.get("searchTerm");

  return (
    <div className="mb-6 hidden flex-wrap justify-between lg:flex">
      <div className="w-96">
        <Input
          name="searchTerm"
          placeholder="Search by name"
          defaultValue={
            searchParams.get("clearSearchBtn") === null && searchTerm !== null
              ? searchTerm
              : ""
          }
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
