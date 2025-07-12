import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import { Form, useSubmit } from "react-router";
import dayjs from "dayjs";
import { useRef } from "react";

import { getSchoolTermsAsync } from "~/services/.server";
import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
  getDistinctTermYears,
  getSelectedTerm,
  URLSafeSearch,
} from "~/services";
import { Input, Select, Title } from "~/components";

import { getAttendancesAsync } from "./services.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const CURRENT_YEAR = dayjs().year();

  const url = new URLSafeSearch(request.url);

  const selectedTermYear =
    url.safeSearchParams.getNullOrEmpty("selectedTermYear") ??
    CURRENT_YEAR.toString();
  const searchTerm = url.safeSearchParams.getNullOrEmpty("search");
  const selectedTermId = url.safeSearchParams.getNullOrEmpty("selectedTermId");
  let selectedTermDate =
    url.safeSearchParams.getNullOrEmpty("selectedTermDate");

  const terms = await getSchoolTermsAsync();

  const { selectedTerm, termsForYear } = getSelectedTerm(
    terms,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
  );

  const currentTerm = getCurrentTermForDate(terms, new Date());
  const distinctTermYears = getDistinctTermYears(terms);

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  if (selectedTermDate === null || !sessionDates.includes(selectedTermDate)) {
    selectedTermDate = getClosestSessionToToday(
      sessionDates.map((date) => dayjs(date).toDate()),
    );
  }

  if (selectedTermDate === null) {
    throw new Error("selectedTermDate is not defined;");
  }

  const attendances = await getAttendancesAsync(
    Number(params.chapterId),
    selectedTermDate,
    searchTerm,
  );

  return {
    attendances,
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    selectedTermDate,
    searchTerm: searchTerm ?? "",
    selectedTermDateLabel: dayjs(selectedTermDate).format("D MMMM YYYY"),
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
    sessionDates: sessionDates
      .map((attendedOn) => dayjs(attendedOn))
      .map((attendedOn) => ({
        value: attendedOn.toISOString(),
        label: attendedOn.format("DD/MM/YYYY"),
      })),
  };
}

export default function Index({
  loaderData: {
    attendances,
    selectedTermYear,
    selectedTermDate,
    selectedTermDateLabel,
    sessionDates,
    selectedTermId,
    termYearsOptions,
    termsOptions,
    searchTerm,
  },
}: Route.ComponentProps) {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);

  const submitForm = () => {
    const formData = new FormData(formRef.current!);
    void submit(formData);
  };

  const onResetClick = () => {
    const formData = new FormData(formRef.current!);
    formData.set("search", "");
    void submit(formData);
  };

  return (
    <>
      <Title>
        Mentor attendances &quot;
        {selectedTermDateLabel}
        &quot;
      </Title>

      <Form
        ref={formRef}
        className="mt-4 flex flex-col items-end gap-4 sm:flex-row"
      >
        <div className="w-full sm:w-auto">
          <div key={selectedTermId} className="w-full sm:w-auto">
            <label className="fieldset-label">Term</label>
            <div className="join">
              <select
                className="select join-item basis-28"
                name="selectedTermYear"
                defaultValue={selectedTermYear}
                onChange={submitForm}
              >
                {termYearsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="select join-item"
                name="selectedTermId"
                defaultValue={selectedTermId}
                onChange={submitForm}
              >
                {termsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            key={selectedTermDate}
            label="Session date"
            name="selectedTermDate"
            defaultValue={selectedTermDate}
            options={sessionDates}
            onChange={submitForm}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Input
            label="Search for a mentor (Press enter to submit)"
            name="search"
            defaultValue={searchTerm}
            hasButton
            placeholder="Search for a mentor"
            onButtonClick={onResetClick}
          />
        </div>
      </Form>

      <div className="mt-4 overflow-auto bg-white">
        <table className="table-zebra table-pin-rows table">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Attended on
              </th>
              <th align="left" className="p-2">
                Chapter
              </th>
              <th align="left" className="p-2">
                Mentor
              </th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 && (
              <tr>
                <td className="p-2 italic" colSpan={3}>
                  No attendaces
                </td>
              </tr>
            )}
            {attendances.map(({ id, attendedOn, chapter, mentor }) => (
              <tr key={id}>
                <td className="p-2">
                  {dayjs(attendedOn).format("D MMMM YYYY")}
                </td>
                <td className="p-2">{chapter.name}</td>
                <td>{mentor.fullName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
