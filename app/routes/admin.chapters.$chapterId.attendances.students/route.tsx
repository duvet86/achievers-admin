import type { LoaderFunctionArgs } from "react-router";

import invariant from "tiny-invariant";
import { Form, useLoaderData, useSubmit } from "react-router";
import dayjs from "dayjs";

import { getSchoolTermsAsync } from "~/services/.server";
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
  const selectedTermId = url.searchParams.get("selectedTermId");
  let selectedTermDate = url.searchParams.get("selectedTermDate");

  const terms = await getSchoolTermsAsync(dayjs().year());
  const todayterm = getCurrentTermForDate(terms, new Date());

  const currentTerm =
    terms.find((t) => t.id.toString() === selectedTermId) ?? todayterm;
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
    selectedTermId: selectedTermId ?? currentTerm.id.toString(),
    selectedTermDate,
    searchTerm: searchTerm ?? "",
    selectedTermDateLabel: dayjs(selectedTermDate).format("D MMMM YYYY"),
    termsList: terms.map(({ id, start, end, name }) => ({
      value: id.toString(),
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
    selectedTermId,
    termsList,
    searchTerm,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const submitForm = () => {
    const form = document.getElementById("attendanceForm") as HTMLFormElement;
    void submit(form);
  };

  const onResetClick = () => {
    (document.getElementById("search") as HTMLInputElement).value = "";
    submitForm();
  };

  return (
    <>
      <Title>
        Student attendances &quot;
        {selectedTermDateLabel}
        &quot;
      </Title>

      <Form
        id="attendanceForm"
        className="mt-4 flex flex-col items-end gap-4 sm:flex-row"
      >
        <div className="w-full sm:w-auto">
          <Select
            key={selectedTermId}
            label="Term"
            name="selectedTermId"
            defaultValue={selectedTermId}
            options={termsList}
            onChange={submitForm}
          />
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
            label="Search for a student (Press enter to submit)"
            name="search"
            defaultValue={searchTerm}
            hasButton
            placeholder="Search for a student"
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
                Student
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
            {attendances.map(({ id, attendedOn, chapter, student }) => (
              <tr key={id}>
                <td className="p-2">
                  {dayjs(attendedOn).format("D MMMM YYYY")}
                </td>
                <td className="p-2">{chapter.name}</td>
                <td>{student.fullName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
