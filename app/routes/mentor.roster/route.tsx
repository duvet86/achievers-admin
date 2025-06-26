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
  EditPencil,
  Eye,
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
import { Select, StateLink, Title } from "~/components";

import {
  getMentorSessionsLookupAsync,
  getUserByAzureADIdAsync,
  getAvailableStudentsForSessionAsync,
  createSessionWithStudentAsync,
  takeSessionFromParterAsync,
  deleteMentorSessionByIdAsync,
  createMentorSession,
  deleteSessionByIdAsync,
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

  const { myMentorSessionsLookup, myPartnersSessionsLookup } =
    await getMentorSessionsLookupAsync(user.chapterId, user.id, currentTerm);

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
    myMentorSessionsLookup,
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

  switch (action) {
    case "createSession": {
      const attendedOn = bodyData.get("attendedOn");
      const studentId = bodyData.get("studentId");
      if (attendedOn === null || studentId === null) {
        throw new Error();
      }
      await createSessionWithStudentAsync({
        attendedOn: attendedOn.toString(),
        chapterId: user.chapterId,
        studentId: Number(studentId),
        mentorId: user.id,
      });
      break;
    }

    case "createMentorSession": {
      const attendedOn = bodyData.get("attendedOn")?.toString();
      const status = bodyData.get("status")?.toString();
      if (attendedOn === undefined || status === undefined) {
        throw new Error();
      }

      await createMentorSession({
        chapterId: user.chapterId,
        mentorId: user.id,
        attendedOn,
        status,
      });
      break;
    }

    case "take": {
      const studentSessionId = bodyData.get("studentSessionId");

      await takeSessionFromParterAsync(Number(studentSessionId), user.id);
      break;
    }

    case "deleteMentorSession": {
      const mentorSessionId = bodyData.get("mentorSessionId");
      await deleteMentorSessionByIdAsync(Number(mentorSessionId));
      break;
    }

    case "deleteSession": {
      const sessionId = bodyData.get("sessionId");
      await deleteSessionByIdAsync(Number(sessionId));
      break;
    }

    default:
      throw new Error("Invalid action type");
  }

  return redirect(
    `/mentor/roster?selectedTermId=${selectedTermId!.toString()}`,
  );
}

export default function Index({
  loaderData: {
    myMentorSessionsLookup,
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

  const handleDeleteMentorSession = (mentorSessionId: number) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "deleteMentorSession");
    formData.append("mentorSessionId", mentorSessionId.toString());
    formData.append("selectedTermId", selectedTermId);

    void submit(formData, { method: "POST" });
  };

  const handleCancelSessionSubmit = (sessionId: number) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "deleteSession");
    formData.append("sessionId", sessionId.toString());
    formData.append("selectedTermId", selectedTermId);

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
          const myMentorSession = myMentorSessionsLookup[attendedOn];
          const myPartnersMentorSession = myPartnersSessionsLookup[attendedOn];

          return (
            <div key={attendedOn} className="border-b border-slate-400">
              <div className="flex w-full flex-col sm:flex-row">
                <div className="p-2 font-medium text-gray-800 sm:basis-1/6">
                  <div className="mb-2 flex h-full items-center justify-center gap-4 border-r border-gray-300 text-lg sm:text-base">
                    {dayjs(attendedOn).format("DD/MM/YYYY")}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4 p-4 sm:basis-5/6">
                  {!myMentorSession && (
                    <ManageSession
                      selectedTermId={selectedTermId}
                      attendedOn={attendedOn}
                      isLoading={isLoading}
                      studentsForSession={manageSessionState[attendedOn]}
                      onSessionStudentClick={onSessionStudentClick(attendedOn)}
                    />
                  )}

                  {myMentorSession &&
                    myMentorSession.sessionAttendance.length === 0 && (
                      <div className="flex flex-col items-center justify-between gap-2 border-b pb-2 sm:flex-row">
                        {myMentorSession.status === "AVAILABLE" ? (
                          <>
                            <div className="text-success flex items-center justify-center gap-2 sm:justify-start">
                              <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                              <span>Available</span>
                            </div>
                            <button
                              className="btn btn-error btn-sm w-full sm:w-36"
                              onClick={handleDeleteMentorSession(
                                myMentorSession.id,
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
                              onClick={handleDeleteMentorSession(
                                myMentorSession.id,
                              )}
                            >
                              <BookmarkBook />
                              Restore
                            </button>
                          </>
                        )}
                      </div>
                    )}

                  {myMentorSession?.sessionAttendance.map(
                    ({ id, hasReport, studentSession }) => (
                      <div
                        key={id}
                        className="flex flex-col items-center justify-between gap-2 border-b pb-2 sm:flex-row"
                      >
                        <div className="text-success flex items-center justify-center gap-2 sm:justify-start">
                          <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                          <span>Booked with</span>{" "}
                          <span className="font-bold">
                            {studentSession.student.fullName}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {!hasReport && (
                            <>
                              <StateLink
                                to={`/mentor/write-report?selectedTermDate=${dayjs(attendedOn).format("YYYY-MM-DD")}T00:00:00.000Z&selectedStudentId=${studentSession.student.id}`}
                                className="btn btn-sm w-full sm:w-36"
                              >
                                <EditPencil />
                                Write report
                              </StateLink>
                              <button
                                onClick={handleCancelSessionSubmit(id)}
                                className="btn btn-error btn-sm w-full sm:w-36"
                              >
                                <Xmark />
                                Cancel
                              </button>
                            </>
                          )}
                          {hasReport && (
                            <StateLink
                              to={`/mentor/sessions/${id}`}
                              className="btn btn-success btn-sm w-full sm:w-36"
                            >
                              <Eye />
                              View report
                            </StateLink>
                          )}
                        </div>
                      </div>
                    ),
                  )}

                  {myPartnersMentorSession &&
                    (myPartnersMentorSession?.status === "UNAVAILABLE" ? (
                      <div className="text-error flex items-center justify-center gap-2 border-b pb-2 sm:justify-start">
                        <ThumbsDown className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="font-bold">
                          {myPartnersMentorSession.mentor.fullName}
                        </span>{" "}
                        is <span className="font-bold">unavailable</span>
                      </div>
                    ) : (
                      myPartnersMentorSession?.sessionAttendance.map(
                        ({ id, completedOn, studentSession }) => (
                          <div
                            key={id}
                            className="flex flex-col items-center justify-between gap-4 border-b pb-2 sm:flex-row"
                          >
                            <div className="text-info flex items-center justify-center gap-2 sm:justify-start">
                              <Group className="h-4 w-4 sm:h-6 sm:w-6" />
                              <span className="font-bold">
                                {myPartnersMentorSession.mentor.fullName}
                              </span>{" "}
                              is mentoring{" "}
                              <span className="font-bold">
                                {studentSession.student.fullName}
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
