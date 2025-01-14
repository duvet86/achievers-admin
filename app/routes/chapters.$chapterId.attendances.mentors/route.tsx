import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Attendace } from "./services.server";

import { Form, Link, useLoaderData, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { Check, NavArrowRight, Xmark } from "iconoir-react";

import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
} from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { Input, Select, Title } from "~/components";

import {
  attendSession,
  getMentorAttendancesLookup,
  getMentorsForSession,
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

  const mentors = await getMentorsForSession(
    Number(params.chapterId),
    searchTerm,
  );

  const attendacesLookup = await getMentorAttendancesLookup(
    Number(params.chapterId),
    selectedTermDate,
  );

  return {
    chapterId: params.chapterId,
    mentors,
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
    mentors,
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

  const removeAttendance = (attendace: Attendace) => () => {
    if (
      !confirm(
        `Are you sure you want to remove the attendace for "${attendace.user.fullName}"?`,
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
        Mentor attendances &quot;
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
          label="Search for a mentor (Press enter to submit)"
          name="search"
          defaultValue={searchTerm}
          hasButton
          placeholder="Search for a mentor"
          onButtonClick={onResetClick}
        />
      </Form>

      <ul key={selectedTermDate} className="mt-4 overflow-auto">
        {mentors.length === 0 && (
          <li className="mt-4 italic">No mentors found</li>
        )}
        {mentors.map(({ id: mentorId, fullName }) => (
          <li
            key={mentorId}
            className={classNames(
              "m-2 flex items-center gap-2 border-b p-2 hover:bg-gray-200",
              {
                "bg-green-200": attendacesLookup[mentorId],
              },
            )}
          >
            <div className="flex flex-1 items-center gap-4">
              <h2 className="basis-56">{fullName}</h2>

              <Link
                className="btn btn-primary sm:basis-32"
                to={`${mentorId}/survey?selectedTerm=${selectedTerm}`}
              >
                Survey <NavArrowRight className="hidden sm:block" />
              </Link>
            </div>

            <div>
              {attendacesLookup[mentorId] ? (
                <button
                  className="btn btn-error"
                  onClick={removeAttendance(attendacesLookup[mentorId])}
                >
                  <span className="hidden sm:block">Remove attendance</span>
                  <Xmark />
                </button>
              ) : (
                <button className="btn btn-outline" onClick={attend(mentorId)}>
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
