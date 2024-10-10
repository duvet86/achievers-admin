import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Form, json, useLoaderData, useSubmit } from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { CheckSquare, Square } from "iconoir-react";

import {
  getClosestSessionToToday,
  getDatesForTerm,
  getEnvironment,
} from "~/services";
import {
  getLoggedUserInfoAsync,
  isLoggedUserBlockedAsync,
  trackException,
  version,
} from "~/services/.server";
import { Input, Navbar, Select, Title } from "~/components";

import {
  attendSession,
  getCurrentTermForDate,
  getMentorAttendancesLookup,
  getMentorsForSession,
  getSchoolTermsForYearAsync,
  removeAttendace,
} from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);
  const isUserBlocked = await isLoggedUserBlockedAsync(
    request,
    "MentorAttendancesArea",
  );

  if (isUserBlocked) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no MentorAttendancesArea permissions.`,
      ),
    );
    throw redirect("/403");
  }

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

  const mentors = await getMentorsForSession(
    Number(params.chapterId),
    selectedTermDate,
    searchTerm,
  );

  const attendacesLookup = await getMentorAttendancesLookup(
    Number(params.chapterId),
    selectedTermDate,
  );

  return json({
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    version,
    mentors,
    attendacesLookup,
    selectedTerm: selectedTerm ?? currentTerm.name,
    selectedTermDate,
    searchTerm: searchTerm ?? "",
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
  });
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
    version,
    environment,
    userName,
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
    submit(
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

  const removeAttendance =
    (attendace: {
      id: number;
      user: {
        id: number;
        fullName: string;
      };
    }) =>
    () => {
      if (
        !confirm(
          `Are you sure you want to remove the attendace for "${attendace.user.fullName}"?`,
        )
      ) {
        return;
      }

      submit(
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
    submit(form);
  };

  const onResetClick = () => {
    (document.getElementById("search") as HTMLInputElement).value = "";
    submitForm();
  };

  return (
    <div className="flex flex-col">
      <Navbar userName={userName} environment={environment} version={version} />

      <main className="content-main mt-16 flex flex-col p-4">
        <Title to="/admin/chapters">
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

        <ul className="mt-4 overflow-auto" key={selectedTermDate}>
          {mentors.length === 0 && (
            <li className="mt-4 italic">No mentors found</li>
          )}
          {mentors.map(({ id, fullName }, index) => (
            <li
              key={id}
              className={classNames(
                "flex items-center justify-between rounded p-2 hover:bg-gray-400",
                {
                  "bg-gray-200": index % 2 === 0,
                },
              )}
            >
              <h2>{fullName}</h2>
              <div>
                {attendacesLookup[id] ? (
                  <button
                    className="btn btn-ghost text-success"
                    onClick={removeAttendance(attendacesLookup[id])}
                  >
                    <CheckSquare />
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={attend(id)}>
                    <Square />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
