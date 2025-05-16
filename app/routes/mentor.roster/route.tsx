import type { Option } from "~/components";
import type { Route } from "./+types/route";

import {
  redirect,
  useFetcher,
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

export async function loader({ request }: Route.LoaderArgs) {
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

  const { mySessionsLookup, myPartnersSessionsLookup } =
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
    termsList: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    selectedTermId: selectedTermId ?? currentTerm.id.toString(),
    mySessionsLookup,
    myPartnersSessionsLookup,
    datesInTerm,
    manageSessionState,
  };
}

export async function action({ request }: Route.ActionArgs) {
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

export default function Index({
  loaderData: {
    mySessionsLookup,
    myPartnersSessionsLookup,
    selectedTermId,
    termsList,
    datesInTerm,
    manageSessionState,
  },
}: Route.ComponentProps) {
  const { submit, state } = useFetcher<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
          const mySession = mySessionsLookup[attendedOn];
          const myPartnersSession = myPartnersSessionsLookup[attendedOn];

          return (
            <div key={attendedOn} className="border-b border-slate-400">
              <div className="flex w-full flex-col sm:flex-row">
                <div className="p-2 font-medium text-gray-800 sm:basis-1/6">
                  <div className="mb-2 flex h-full items-center justify-center gap-4 border-r border-gray-300 text-lg sm:text-base">
                    {dayjs(attendedOn).format("DD/MM/YYYY")}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4 p-4 sm:basis-5/6">
                  {!mySession && (
                    <ManageSession
                      selectedTermId={selectedTermId}
                      attendedOn={attendedOn}
                      isLoading={isLoading}
                      studentsForSession={manageSessionState[attendedOn]}
                      onSessionStudentClick={onSessionStudentClick(attendedOn)}
                    />
                  )}

                  {mySession && mySession.studentSession.length === 0 && (
                    <div className="flex flex-col items-center justify-between gap-2 border-b pb-2 sm:flex-row">
                      {mySession.status === "AVAILABLE" ? (
                        <>
                          <div className="text-success flex items-center justify-center gap-2 sm:justify-start">
                            <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>You are available</span>
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
                          <div className="text-error flex items-center justify-center gap-2 sm:justify-start">
                            <ThumbsDown className="h-4 w-4 sm:h-6 sm:w-6" />
                            <span>You are unavailable</span>
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

                  {mySession?.studentSession.map(
                    ({ id, student, hasReport }) => (
                      <div
                        key={id}
                        className="flex flex-col items-center justify-between gap-2 border-b pb-2 sm:flex-row"
                      >
                        <div className="text-success flex items-center justify-center gap-2 sm:justify-start">
                          <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                          <span>You are booked with</span>{" "}
                          <span className="font-bold">{student.fullName}</span>
                        </div>

                        {!hasReport && (
                          <button
                            onClick={handleCancelSessionSubmit(
                              mySession.id,
                              id,
                            )}
                            className="btn btn-error btn-sm w-full sm:w-36"
                          >
                            <Xmark />
                            Cancel
                          </button>
                        )}
                      </div>
                    ),
                  )}

                  {myPartnersSession &&
                    (myPartnersSession?.status === "UNAVAILABLE" ? (
                      <div className="text-error flex items-center justify-center gap-2 border-b pb-2 sm:justify-start">
                        <ThumbsDown className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="font-bold">
                          {myPartnersSession.mentor.fullName}
                        </span>{" "}
                        is <span className="font-bold">unavailable</span>
                      </div>
                    ) : (
                      myPartnersSession?.studentSession.map(
                        ({ id, student, completedOn }) => (
                          <div
                            key={id}
                            className="flex flex-col items-center justify-between gap-4 border-b pb-2 sm:flex-row"
                          >
                            <div className="text-info flex items-center justify-center gap-2 sm:justify-start">
                              <Group className="h-4 w-4 sm:h-6 sm:w-6" />
                              <span className="font-bold">
                                {myPartnersSession.mentor.fullName}
                              </span>{" "}
                              is mentoring{" "}
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
