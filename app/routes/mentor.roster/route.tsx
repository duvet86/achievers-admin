import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Option } from "~/components";

import {
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";
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
  getSchoolTermsAsync,
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
  const selectedTermId = url.searchParams.get("selectedTermId");
  const attendedOn = url.searchParams.get("attendedOn");

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);
  const terms = await getSchoolTermsAsync();

  const termsForYear = terms.filter(({ year }) => year === dayjs().year());

  const todayterm = getCurrentTermForDate(termsForYear, new Date());
  const currentTerm =
    termsForYear.find((t) => t.id.toString() === selectedTermId) ?? todayterm;

  const sessionsLookup = await getSessionsLookupAsync(
    user.chapterId,
    user.id,
    currentTerm,
  );

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
    currentMentorId: user.id,
    termsList: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    selectedTermId: selectedTermId ?? currentTerm.id.toString(),
    sessionsLookup,
    datesInTerm,
    manageSessionState,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const bodyData = await request.formData();

  const action = bodyData.get("action");
  const selectedTermId = bodyData.get("selectedTermId");
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

  return redirect(
    `/mentor/roster?selectedTermId=${selectedTermId!.toString()}`,
  );
}

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const { data, submit, state } = useFetcher<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    currentMentorId,
    sessionsLookup,
    selectedTermId,
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
      formData.append("selectedTermId", selectedTermId);

      if (studentSessionId !== null) {
        formData.append("studentSessionId", studentSessionId.toString());
      }

      void submit(formData, { method: "POST" });
    };

  const handleTakeSessionSubmit = (studentSessionId: number) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "take");
    formData.append("studentSessionId", studentSessionId.toString());
    formData.append("selectedTermId", selectedTermId);

    void submit(formData, { method: "POST" });
  };

  const onSessionStudentClick = (attendedOn: string) => () => {
    const currentAttendedOn = searchParams.get("attendedOn");

    searchParams.set("selectedTermId", selectedTermId);
    searchParams.set(
      "attendedOn",
      currentAttendedOn === attendedOn ? "" : attendedOn,
    );

    void navigate(`?${searchParams.toString()}`);
  };

  const onTermChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTermId", event.target.value);
    searchParams.set("attendedOn", "");

    void navigate(`?${searchParams.toString()}`);
  };

  return (
    <>
      <Title>Roster planner</Title>

      <div className="mt-2 mb-6">
        <Select
          name="selectedTermId"
          defaultValue={selectedTermId}
          options={termsList}
          onChange={onTermChange}
        />
      </div>

      <div className="join join-vertical w-full">
        {datesInTerm.map((attendedOn) => {
          const session = sessionsLookup[attendedOn];
          const isMySession = session?.mentor.id === currentMentorId;

          return (
            <div key={attendedOn} className="border-b border-slate-400">
              <div className="flex w-full flex-col sm:flex-row">
                <div className="p-2 font-medium text-gray-800 sm:basis-1/6">
                  <div className="mb-2 flex h-full items-center justify-center gap-4 border-r border-gray-300 text-lg sm:text-base">
                    {dayjs(attendedOn).format("DD/MM/YYYY")}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4 p-4 sm:basis-5/6">
                  {isMySession && session.studentSession.length === 0 && (
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                      {session.status === "AVAILABLE" ? (
                        <>
                          <div className="text-success flex items-center justify-center gap-2 sm:justify-start">
                            <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>Available</span>
                          </div>
                          <button
                            className="btn btn-error btn-sm w-full sm:w-36"
                            onClick={handleCancelSessionSubmit(
                              session.id,
                              null,
                            )}
                          >
                            <Xmark />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-error flex items-center justify-center gap-2 sm:justify-start">
                            <ThumbsDown className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>Unavailable</span>
                          </div>
                          <button
                            className="btn btn-primary btn-sm w-full sm:w-36"
                            onClick={handleCancelSessionSubmit(
                              session.id,
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

                  {isMySession &&
                    session.studentSession.map(({ id, student, hasReport }) => (
                      <div
                        key={id}
                        className="flex flex-col items-center justify-between gap-2 sm:flex-row"
                      >
                        <div className="text-success flex items-center justify-center gap-2 sm:justify-start">
                          <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                          <span>Booked with</span>{" "}
                          <span className="font-bold">{student.fullName}</span>
                        </div>

                        {!hasReport && (
                          <button
                            onClick={handleCancelSessionSubmit(session.id, id)}
                            className="btn btn-error btn-sm w-full sm:w-36"
                          >
                            <Xmark />
                            Cancel
                          </button>
                        )}
                      </div>
                    ))}

                  {!isMySession &&
                    (session?.status === "UNAVAILABLE" ? (
                      <div className="text-error flex items-center justify-center gap-2 sm:justify-start">
                        <ThumbsDown className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="font-bold">
                          {session.mentor.fullName}
                        </span>{" "}
                        is <span className="font-bold">unavailable</span>
                      </div>
                    ) : (
                      session?.studentSession.map(
                        ({ id, student, completedOn }) => (
                          <div
                            key={id}
                            className="flex flex-col items-center justify-between gap-4 sm:flex-row"
                          >
                            <div className="text-info flex items-center justify-center gap-2 sm:justify-start">
                              <Group className="h-4 w-4 sm:h-6 sm:w-6" />
                              <span className="font-bold">
                                {session.mentor.fullName}
                              </span>{" "}
                              mentoring{" "}
                              <span className="font-bold">
                                {student.fullName}
                              </span>
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
                      )
                    ))}

                  {!isMySession && (
                    <ManageSession
                      selectedTermId={selectedTermId}
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
