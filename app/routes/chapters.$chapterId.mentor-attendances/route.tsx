import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  json,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { CheckSquare, FloppyDiskArrowIn, Square } from "iconoir-react";

import { getDatesForTerm, getEnvironment } from "~/services";
import {
  getLoggedUserInfoAsync,
  isLoggedUserBlockedAsync,
  trackException,
  version,
} from "~/services/.server";
import { Input, Navbar, Select, Title } from "~/components";

import {
  attendSession,
  getClosestSessionDate,
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
    selectedTermDate = getClosestSessionDate(
      sessionDates.map((date) => dayjs(date).toDate()),
    );
  }

  const mentors = await getMentorsForSession(
    Number(params.chapterId),
    selectedTermDate,
    searchTerm,
  );

  const attendacesLookup = await getMentorAttendancesLookup(
    Number(params.chapterId),
    selectedTermDate,
    searchTerm,
  );

  return json({
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    version,
    mentors,
    attendacesLookup,
    selectedTerm: selectedTerm ?? currentTerm.name,
    selectedTermDate,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    sessionDates: sessionDates
      .map((attendedOn) => dayjs(attendedOn))
      .map((attendedOn) => ({
        value: attendedOn.format("YYYY-MM-DD") + "T00:00:00Z",
        label: attendedOn.format("DD/MM/YYYY"),
      })),
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const attendaceDate = url.searchParams.get("attendaceDate");

  const bodyData = (await request.json()) as {
    action: "attend" | "remove";
    mentorId: number;
    attendaceId: number;
  };

  if (bodyData.action === "attend") {
    await attendSession(
      Number(params.chapterId),
      bodyData.mentorId,
      attendaceDate,
    );
  } else if (bodyData.action === "remove") {
    await removeAttendace(bodyData.attendaceId);
  } else {
    throw new Error();
  }

  return null;
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const { state, submit, Form, data, load } = useFetcher<typeof loader>();
  const [searchParams] = useSearchParams();

  const {
    version,
    environment,
    userName,
    mentors,
    attendacesLookup,
    selectedTerm,
    selectedTermDate,
    termsList,
    sessionDates,
  } = data ?? loaderData;

  const attend = (mentorId: number) => () => {
    submit(
      {
        action: "attend",
        mentorId,
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchParams.set(
      "search",
      (document.getElementById("search") as HTMLInputElement).value,
    );
    load(`?${searchParams.toString()}`);
  };

  const onResetClick = () => {
    (document.getElementById("attendaceSearchForm") as HTMLFormElement).reset();
  };

  const handleSelectChange =
    (value: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      searchParams.set(value, event.target.value);
      load(`?${searchParams.toString()}`);
    };

  const isLoading = state === "loading";

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
          id="attendaceSearchForm"
          className="mt-4 flex flex-col items-end gap-4 sm:flex-row"
          onSubmit={onSubmit}
        >
          <Select
            key={selectedTerm}
            label="Term"
            name="selectedTerm"
            defaultValue={selectedTerm}
            options={termsList}
            onChange={handleSelectChange("selectedTerm")}
          />
          <Select
            key={selectedTermDate}
            label="Session date"
            name="selectedTermDate"
            defaultValue={selectedTermDate}
            options={sessionDates}
            onChange={handleSelectChange("selectedTermDate")}
          />
          <Input
            label="Search for a mentor"
            name="search"
            hasButton
            placeholder="Search for a mentor"
            onButtonClick={onResetClick}
          />

          <button className="btn btn-primary w-48 gap-2" type="submit">
            <FloppyDiskArrowIn />
            Search
          </button>
        </Form>

        <ul className="mt-4 overflow-auto" key={selectedTermDate}>
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
                    disabled={isLoading}
                  >
                    <CheckSquare />
                  </button>
                ) : (
                  <button
                    className="btn btn-ghost"
                    onClick={attend(id)}
                    disabled={isLoading}
                  >
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
