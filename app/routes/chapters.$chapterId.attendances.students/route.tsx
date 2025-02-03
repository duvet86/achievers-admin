import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Attendance } from "./services.server";

import { Form, useLoaderData, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { Xmark, Check } from "iconoir-react";

import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
} from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { Input, Select, Title } from "~/components";

import {
  attendSession,
  getStudentAttendancesLookup,
  getStudentsForSession,
  removeAttendace,
} from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search");
  const selectedTerm = url.searchParams.get("selectedTerm");
  let selectedTermDate = url.searchParams.get("selectedTermDate");

  const terms = await getSchoolTermsAsync(dayjs().year());
  const todayterm = getCurrentTermForDate(terms, new Date());

  const currentTerm =
    terms.find((t) => t.id.toString() === selectedTerm) ?? todayterm;
  const sessionDates = getDatesForTerm(currentTerm.start, currentTerm.end);

  if (selectedTermDate === null || !sessionDates.includes(selectedTermDate)) {
    selectedTermDate = getClosestSessionToToday(
      sessionDates.map((date) => dayjs(date).toDate()),
    );
  }

  if (selectedTermDate === null) {
    throw new Error("selectedTermDate is not defined;");
  }

  const students = await getStudentsForSession(
    Number(params.chapterId),
    searchTerm,
  );

  const attendacesLookup = await getStudentAttendancesLookup(
    Number(params.chapterId),
    selectedTermDate,
  );

  return {
    chapterId: params.chapterId,
    students,
    attendacesLookup,
    selectedTerm: selectedTerm ?? currentTerm.id.toString(),
    selectedTermDate,
    searchTerm: searchTerm ?? "",
    termsList: terms.map(({ start, end, name, id }) => ({
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

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const bodyData = (await request.json()) as {
    action: "attend" | "remove";
    mentorId: number;
    attendaceId: number;
    attendanceDate: string;
  };

  if (bodyData.action === "attend") {
    await attendSession(
      Number(params.chapterId),
      bodyData.mentorId,
      bodyData.attendanceDate,
    );
  } else if (bodyData.action === "remove") {
    await removeAttendace(bodyData.attendaceId);
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Invalid action: ${bodyData.action}`);
  }

  return null;
}

export default function Index() {
  const {
    chapterId,
    students,
    attendacesLookup,
    selectedTerm,
    selectedTermDate,
    searchTerm,
    termsList,
    sessionDates,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const attend = (mentorId: number) => () => {
    void submit(
      {
        action: "attend",
        mentorId,
        attendanceDate: selectedTermDate,
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const removeAttendance = (attendace: Attendance) => () => {
    if (
      !confirm(
        `Are you sure you want to remove the attendace for "${attendace.student.fullName}"?`,
      )
    ) {
      return;
    }

    void submit(
      {
        action: "remove",
        attendaceId: attendace.id,
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

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
      <Title to={`/chapters/${chapterId}/attendances`}>
        Student attendances &quot;
        {dayjs(selectedTermDate).format("D MMMM YYYY")}
        &quot;
      </Title>

      <Form
        id="attendanceForm"
        className="mt-4 flex flex-col items-end gap-4 sm:flex-row"
      >
        <div className="w-full sm:w-auto">
          <Select
            key={selectedTerm}
            label="Term"
            name="selectedTerm"
            defaultValue={selectedTerm}
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

      <ul className="list bg-base-100 mt-2">
        {students.map(({ id: studentId, fullName }, index) => (
          <li
            key={studentId}
            className={classNames("list-row flex cursor-pointer items-center", {
              "bg-green-200": attendacesLookup[studentId],
              "hover:bg-gray-200": !attendacesLookup[studentId],
            })}
            onClick={
              attendacesLookup[studentId]
                ? removeAttendance(attendacesLookup[studentId])
                : attend(studentId)
            }
          >
            <div className="border-r pr-2 text-4xl font-thin tabular-nums opacity-30">
              {index}
            </div>

            <h2 className="flex-1 text-2xl font-thin">{fullName}</h2>

            <div>
              {attendacesLookup[studentId] ? (
                <button className="btn btn-error">
                  <span className="hidden sm:block">Remove attendance</span>
                  <Xmark />
                </button>
              ) : (
                <button className="btn btn-outline">
                  <span className="hidden sm:block">Mark attendance</span>
                  <Check />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
