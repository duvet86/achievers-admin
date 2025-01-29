import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Attendance } from "./services.server";

import { Form, Link, useLoaderData, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import {
  Xmark,
  Check,
  NavArrowRight,
  Group,
  GraduationCap,
} from "iconoir-react";

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
          label="Search for a student (Press enter to submit)"
          name="search"
          defaultValue={searchTerm}
          hasButton
          placeholder="Search for a student"
          onButtonClick={onResetClick}
        />
      </Form>

      <ul key={selectedTermDate} className="mt-4 overflow-auto">
        {students.length === 0 && (
          <li className="mt-4 italic">No mentors found</li>
        )}
        {students.map(({ id: studentId, fullName }) => (
          <li
            key={studentId}
            className={classNames(
              "m-2 flex items-center gap-2 border-b p-2 hover:bg-gray-200",
              {
                "bg-green-200": attendacesLookup[studentId],
              },
            )}
          >
            <div className="flex flex-1 items-center gap-4">
              <h2 className="basis-56">{fullName}</h2>

              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-primary sm:basis-32"
                >
                  Surveys <NavArrowRight className="hidden sm:block" />
                </div>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content rounded-box bg-base-100 z-1 w-52 p-2 shadow-sm"
                >
                  <li>
                    <Link
                      className="m-2"
                      to={`${studentId}/student-survey?selectedTerm=${selectedTerm}`}
                    >
                      <GraduationCap /> Student Survey
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="m-2"
                      to={`${studentId}/parent-survey?selectedTerm=${selectedTerm}`}
                    >
                      <Group /> Parent Survey (Re-enrolment)
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              {attendacesLookup[studentId] ? (
                <button
                  className="btn btn-error"
                  onClick={removeAttendance(attendacesLookup[studentId])}
                >
                  <span className="hidden sm:block">Remove attendance</span>
                  <Xmark />
                </button>
              ) : (
                <button className="btn btn-outline" onClick={attend(studentId)}>
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
