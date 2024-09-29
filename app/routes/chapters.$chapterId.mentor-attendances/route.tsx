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

import { getEnvironment } from "~/services";
import {
  getLoggedUserInfoAsync,
  isLoggedUserBlockedAsync,
  trackException,
  version,
} from "~/services/.server";
import { Input, Navbar, Title } from "~/components";

import {
  attendSession,
  getMentorAttendancesLookup,
  getMentorsForSession,
  removeAttendace,
} from "./services.server";
import classNames from "classnames";
import { CheckSquare, FloppyDiskArrowIn, Square } from "iconoir-react";

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
  const attendaceDate = url.searchParams.get("attendaceDate");
  const searchTerm = url.searchParams.get("search");

  const mentors = await getMentorsForSession(
    Number(params.chapterId),
    attendaceDate,
    searchTerm,
  );

  const attendacesLookup = await getMentorAttendancesLookup(
    Number(params.chapterId),
    attendaceDate,
    searchTerm,
  );

  return json({
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    version,
    mentors,
    attendacesLookup,
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

  const { version, environment, userName, mentors, attendacesLookup } =
    data ?? loaderData;

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

  const isLoading = state === "loading";

  return (
    <div className="flex flex-col">
      <Navbar userName={userName} environment={environment} version={version} />

      <main className="content-main mt-16 p-4">
        <Title to="/admin/chapters">Mentor attendances</Title>

        <Form
          id="attendaceSearchForm"
          className="mt-4 flex flex-col items-center gap-4 sm:flex-row"
          onSubmit={onSubmit}
        >
          <Input
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

        <ul className="mt-4">
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
