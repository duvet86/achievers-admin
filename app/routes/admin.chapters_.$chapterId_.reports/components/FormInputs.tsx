import { useSearchParams } from "@remix-run/react";

import { DateInput, Input } from "~/components";

interface Props {
  onFormClear: () => void;
}

export default function FormInputs({ onFormClear }: Props) {
  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get("searchTerm");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const isCompleted = searchParams.get("isCompleted");
  const isSignedOff = searchParams.get("isSignedOff");

  return (
    <div className="mb-6 hidden flex-col gap-4 lg:flex">
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

      <div className="flex items-end gap-8">
        <div className="w-96">
          <Input
            name="searchTerm"
            label="Search by name"
            placeholder="Search by name"
            defaultValue={
              searchParams.get("clearSearchBtn") === null && searchTerm !== null
                ? searchTerm
                : ""
            }
          />
        </div>

        <div className="form-control">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              name="isCompleted"
              className="checkbox bg-base-100"
              defaultChecked={
                searchParams.get("clearSearchBtn") === null &&
                isCompleted !== null
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
                searchParams.get("clearSearchBtn") === null &&
                isSignedOff !== null
                  ? isSignedOff === "on"
                  : false
              }
            />
            <span className="label-text">Only signed off</span>
          </label>
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-6">
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
