import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Option } from "~/components";

import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import dayjs from "dayjs";
import {
  BookmarkBook,
  Group,
  ThumbsDown,
  ThumbsUp,
  Xmark,
} from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getSchoolTermsForYearAsync,
} from "~/services/.server";
import { getCurrentTermForDate, getDatesForTerm } from "~/services";
import { Select, Title } from "~/components";

import {
  getSessionsLookupAsync,
  getUserByAzureADIdAsync,
  getAvailableStudentsForSessionAsync,
  createSessionAsync,
  takeSessionFromParterAsync,
  removeSessionAsync,
} from "./services.server";
import { ManageSession } from "./components/ManageSession";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");
  const attendedOn = url.searchParams.get("attendedOn");

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);
  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const todayterm = getCurrentTermForDate(terms, new Date());
  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;

  const { mySessionsLookup, myStudentsSessionsLookup } =
    await getSessionsLookupAsync(user.chapterId, user.id, currentTerm);

  const studentsForSession = attendedOn
    ? await getAvailableStudentsForSessionAsync(
        user.chapterId,
        user.id,
        attendedOn.toString(),
      )
    : null;

  const datesInTerm = getDatesForTerm(currentTerm.start, currentTerm.end).map(
    (date) => dayjs(date).format("YYYY-MM-DD"),
  );

  const manageSessionState = datesInTerm.reduce<
    Record<string, Option[] | null>
  >((res, val) => {
    if (val === attendedOn) {
      res[val] = studentsForSession as Option[];
    } else {
      res[val] = null;
    }

    return res;
  }, {});

  return {
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    currentTermName: currentTerm.name,
    mySessionsLookup,
    myStudentsSessionsLookup,
    datesInTerm,
    manageSessionState,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const bodyData = await request.formData();

  const action = bodyData.get("action");
  const attendedOn = bodyData.get("attendedOn");
  const studentId = bodyData.get("studentId");
  const status = bodyData.get("status");
  const sessionId = bodyData.get("sessionId");
  const studentSessionId = bodyData.get("studentSessionId");

  switch (action) {
    case "book":
      if (attendedOn === null || status === null) {
        throw new Error();
      }

      await createSessionAsync({
        attendedOn: attendedOn.toString(),
        chapterId: user.chapterId,
        studentId: studentId ? Number(studentId) : null,
        mentorId: user.id,
        status: status.toString(),
      });
      break;

    case "take":
      await takeSessionFromParterAsync(Number(studentSessionId), user.id);
      break;

    case "cancel":
      await removeSessionAsync(
        Number(sessionId),
        studentSessionId ? Number(studentSessionId) : null,
      );
      break;

    default:
      throw new Error("Invalid action type");
  }

  return null;
}

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const { data, submit, load, state } = useFetcher<typeof loader>();
  const [searchParams] = useSearchParams();

  const {
    mySessionsLookup,
    myStudentsSessionsLookup,
    currentTermName,
    termsList,
    datesInTerm,
    manageSessionState,
  } = data ?? initialData;

  const isLoading = state !== "idle";

  const handleCancelSessionSubmit =
    (sessionId: number, studentSessionId: number | null) => () => {
      if (!confirm(`Are you sure?`)) {
        return;
      }

      const formData = new FormData();
      formData.append("action", "cancel");
      formData.append("sessionId", sessionId.toString());

      if (studentSessionId !== null) {
        formData.append("studentSessionId", studentSessionId.toString());
      }

      searchParams.set("attendedOn", "");

      void submit(formData, {
        method: "POST",
      });
    };

  const handleTakeSessionSubmit = (studentSessionId: number) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "take");
    formData.append("studentSessionId", studentSessionId.toString());

    searchParams.set("attendedOn", "");

    void submit(formData, {
      method: "POST",
    });
  };

  const onSessionStudentClick = (attendedOn: string) => () => {
    const currentAttendedOn = searchParams.get("attendedOn");

    searchParams.set(
      "attendedOn",
      currentAttendedOn === attendedOn ? "" : attendedOn,
    );

    void load(`?${searchParams.toString()}`);
  };

  const onTermChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTerm", event.target.value);
    searchParams.set("attendedOn", "");

    void load(`?${searchParams.toString()}`);
  };

  return (
    <>
      <Title>Roster planner</Title>

      <div className="mb-6">
        <Select
          label="Term"
          name="selectedTerm"
          defaultValue={currentTermName}
          options={termsList}
          onChange={onTermChange}
        />
      </div>

      <div className="join join-vertical w-full">
        {datesInTerm.map((attendedOn) => {
          const mySession = mySessionsLookup[attendedOn];
          const studentSessions = myStudentsSessionsLookup[attendedOn];

          return (
            <div key={attendedOn} className="border-b-2 border-slate-400">
              <div className="flex w-full flex-col sm:flex-row">
                <div className="p-2 font-medium text-gray-800 sm:basis-1/6">
                  <div className="mb-2 flex h-full items-center justify-center gap-4 border-r text-lg sm:text-base">
                    {dayjs(attendedOn).format("DD/MM/YYYY")}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4 p-4 sm:basis-5/6">
                  {mySession && mySession.studentSession.length === 0 && (
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                      {mySession.status === "AVAILABLE" ? (
                        <>
                          <div className="flex items-center justify-center gap-2 text-success sm:justify-start">
                            <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>Available</span>
                          </div>
                          <button
                            className="btn btn-error btn-sm w-full sm:w-36"
                            onClick={handleCancelSessionSubmit(
                              mySession.id,
                              null,
                            )}
                          >
                            <Xmark />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-2 text-error sm:justify-start">
                            <ThumbsDown className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>Unavailable</span>
                          </div>
                          <button
                            className="btn btn-primary btn-sm w-full sm:w-36"
                            onClick={handleCancelSessionSubmit(
                              mySession.id,
                              null,
                            )}
                          >
                            <BookmarkBook />
                            Restore
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {mySession &&
                    mySession.studentSession.length > 0 &&
                    mySession.studentSession.map(
                      ({ id, student, hasReport }) => (
                        <div
                          key={id}
                          className="flex flex-col items-center justify-between gap-2 sm:flex-row"
                        >
                          <div className="flex items-center justify-center gap-2 text-success sm:justify-start">
                            <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>Booked with</span>{" "}
                            <span className="font-bold">
                              {student.fullName}
                            </span>
                          </div>

                          {!hasReport && (
                            <button
                              onClick={handleCancelSessionSubmit(
                                mySession.id,
                                id,
                              )}
                              className="btn btn-error btn-sm w-full sm:w-36"
                            >
                              <BookmarkBook />
                              Cancel
                            </button>
                          )}
                        </div>
                      ),
                    )}

                  {mySession && <hr />}

                  {studentSessions?.map(
                    ({ id, session, student, completedOn }) => (
                      <div
                        key={id}
                        className="flex flex-col items-center justify-between gap-4 sm:flex-row"
                      >
                        <div className="flex items-center justify-center gap-2 text-info sm:justify-start">
                          <Group className="h-4 w-4 sm:h-6 sm:w-6" />
                          <span className="font-bold">
                            {session.mentor.fullName}
                          </span>{" "}
                          mentoring{" "}
                          <span className="font-bold">{student.fullName}</span>
                        </div>
                        {!completedOn && (
                          <button
                            onClick={handleTakeSessionSubmit(id)}
                            className="btn btn-secondary btn-sm w-full sm:w-36"
                          >
                            <BookmarkBook />
                            Take
                          </button>
                        )}
                      </div>
                    ),
                  )}

                  {!mySession && (
                    <ManageSession
                      attendedOn={attendedOn}
                      isLoading={isLoading}
                      studentsForSession={manageSessionState[attendedOn]}
                      onSessionStudentClick={onSessionStudentClick(attendedOn)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
