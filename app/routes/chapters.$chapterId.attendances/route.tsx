import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Form, json, useLoaderData, useSubmit } from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { CheckSquare, Square } from "iconoir-react";

import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
  getEnvironment,
} from "~/services";
import {
  getChapterFromAttendancesRole,
  getLoggedUserInfoAsync,
  getSchoolTermsForYearAsync,
  isLoggedUserBlockedAsync,
  trackException,
  version,
} from "~/services/.server";
import { Input, Navbar, Select, Title } from "~/components";

import {
  attendSession,
  getMentorAttendancesLookup,
  getMentorsForSession,
  removeAttendace,
} from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const isUserBlocked = await isLoggedUserBlockedAsync(
    request,
    "MentorAttendancesArea",
  );

  const loggedUser = await getLoggedUserInfoAsync(request);
  const chapterId = getChapterFromAttendancesRole(loggedUser.roles);

  if (isUserBlocked || chapterId !== Number(params.chapterId)) {
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
        <Title>
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
              onClick={
                attendacesLookup[mentorId]
                  ? removeAttendance(attendacesLookup[mentorId])
                  : attend(mentorId)
              }
              className={classNames(
                "m-2 flex cursor-pointer items-center rounded p-2 hover:bg-gray-200",
                {
                  "bg-green-200": attendacesLookup[mentorId],
                },
              )}
            >
              <div className="flex flex-1 gap-4">
                <h2 className="basis-56">{fullName}</h2>
              </div>

              <div>
                {attendacesLookup[mentorId] ? (
                  <button className="btn btn-ghost">
                    <CheckSquare />
                  </button>
                ) : (
                  <button className="btn btn-ghost">
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
