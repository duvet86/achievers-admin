import type { LoaderFunctionArgs } from "@remix-run/node";

import invariant from "tiny-invariant";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";

import { getSchoolTermsForYearAsync } from "~/services/.server";
import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
} from "~/services";
import { Input, Select, Title } from "~/components";

import { getAttendancesAsync } from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search");
  const selectedTerm = url.searchParams.get("selectedTerm");
  let selectedTermDate = url.searchParams.get("selectedTermDate");

  const terms = await getSchoolTermsForYearAsync(dayjs().year());
  const todayterm = getCurrentTermForDate(terms, new Date());

  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;
  const sessionDates = getDatesForTerm(currentTerm.start, currentTerm.end);

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
    selectedTerm: selectedTerm ?? currentTerm.name,
    selectedTermDate,
    searchTerm: searchTerm ?? "",
    selectedTermDateLabel: dayjs(selectedTermDate).format("D MMMM YYYY"),
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    sessionDates: sessionDates
      .map((attendedOn) => dayjs(attendedOn))
      .map((attendedOn) => ({
        value: attendedOn.toISOString(),
        label: attendedOn.format("DD/MM/YYYY"),
      })),
  };
}

export default function Index() {
  const {
    attendances,
    selectedTermDate,
    selectedTermDateLabel,
    sessionDates,
    selectedTerm,
    termsList,
    searchTerm,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const submitForm = () => {
    const form = document.getElementById("attendanceForm") as HTMLFormElement;
    submit(form);
  };

  const onResetClick = () => {
    (document.getElementById("search") as HTMLInputElement).value = "";
    submitForm();
  };

  return (
    <>
      <Title>
        Mentor attendances &quot;
        {selectedTermDateLabel}
        &quot;
      </Title>

      <Form
        id="attendanceForm"
        className="mt-4 flex flex-col items-end gap-4 sm:flex-row"
      >
        <Select
          key={selectedTerm}
          label="Term"
          name="selectedTerm"
          defaultValue={selectedTerm}
          options={termsList}
          onChange={submitForm}
        />
        <Select
          key={selectedTermDate}
          label="Session date"
          name="selectedTermDate"
          defaultValue={selectedTermDate}
          options={sessionDates}
          onChange={submitForm}
        />
        <Input
          label="Search for a mentor (Press enter to submit)"
          name="search"
          defaultValue={searchTerm}
          hasButton
          placeholder="Search for a mentor"
          onButtonClick={onResetClick}
        />
      </Form>

      <div className="mt-4 overflow-auto bg-white">
        <table className="table table-zebra table-pin-rows">
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
            {attendances.map(({ id, attendedOn, chapter, user }) => (
              <tr key={id}>
                <td className="border p-2">
                  {dayjs(attendedOn).format("D MMMM YYYY")}
                </td>
                <td className="border p-2">{chapter.name}</td>
                <td className="border">{user.fullName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
