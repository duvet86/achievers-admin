/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { EditorState } from "lexical";
import type { Route } from "./+types/route";
import type { ActionType } from "./services.server";

import { Form, redirect, useSubmit } from "react-router";
import { useRef } from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import {
  CheckCircle,
  WarningTriangle,
  Calendar,
  InfoCircle,
  UserXmark,
} from "iconoir-react";

import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
  getDistinctTermYears,
  getSelectedTerm,
  isEditorEmpty,
  isStringNullOrEmpty,
} from "~/services";
import {
  getSchoolTermsAsync,
  getLoggedUserInfoAsync,
} from "~/services/.server";
import {
  Editor,
  EditorQuestions,
  Select,
  StateLink,
  SubTitle,
  Title,
} from "~/components";
import editorStylesheetUrl from "~/styles/editor.css?url";

import {
  geSessionAsync,
  getUserByAzureADIdAsync,
  getStudentsAsync,
  createSessionAsync,
  updateSessionAsync,
} from "./services.server";
import { isSessionDateInTheFuture } from "./services.client";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const CURRENT_YEAR = dayjs().year();

  const url = new URL(request.url);
  const selectedTermYear = isStringNullOrEmpty(
    url.searchParams.get("selectedTermYear"),
  )
    ? CURRENT_YEAR.toString()
    : url.searchParams.get("selectedTermYear")!;
  const selectedTermId = isStringNullOrEmpty(
    url.searchParams.get("selectedTermId"),
  )
    ? null
    : url.searchParams.get("selectedTermId");
  let selectedTermDate = isStringNullOrEmpty(
    url.searchParams.get("selectedTermDate"),
  )
    ? null
    : url.searchParams.get("selectedTermDate");
  let selectedStudentId = isStringNullOrEmpty(
    url.searchParams.get("selectedStudentId"),
  )
    ? null
    : url.searchParams.get("selectedStudentId");

  const terms = await getSchoolTermsAsync();

  const { selectedTerm, termsForYear } = getSelectedTerm(
    terms,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
  );

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const students = await getStudentsAsync(user.id, user.chapterId);

  selectedStudentId = selectedStudentId ?? students[0].id.toString();

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  if (selectedTermDate === null || !sessionDates.includes(selectedTermDate)) {
    selectedTermDate =
      getClosestSessionToToday(
        sessionDates.map((date) => dayjs(date).toDate()),
      ) ?? sessionDates[0];
  }

  const session = await geSessionAsync(
    user.id,
    Number(selectedStudentId),
    user.chapterId,
    selectedTermDate,
  );

  if (session?.isCancelled) {
    return redirect(`/mentor/sessions/${session.id}/student-absent`);
  }

  const isNotMyReport =
    session !== null && session.mentorSession.mentorId !== user.id;

  const currentTerm = getCurrentTermForDate(terms, new Date());
  const distinctTermYears = getDistinctTermYears(terms);

  return {
    students,
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    selectedTermDate,
    selectedStudentId,
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
    sessionDates: sessionDates
      .map((attendedOn) => dayjs(attendedOn))
      .map((attendedOn) => ({
        value: attendedOn.toISOString(),
        label: attendedOn.format("DD/MM/YYYY"),
      })),
    session,
    isNotMyReport,
    isReadOnlyEditor:
      session != null &&
      (session.completedOn !== null ||
        session.signedOffOn !== null ||
        isNotMyReport),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const bodyData = await request.json();

  const actionType = bodyData.actionType;
  const sessionId = bodyData.sessionId;
  const studentId = bodyData.studentId;
  const attendedOn = bodyData.attendedOn;
  const report = bodyData.report;

  if (sessionId !== null) {
    await updateSessionAsync({
      actionType,
      sessionId,
      report,
    });
  } else {
    await createSessionAsync({
      actionType,
      chapterId: user.chapterId,
      mentorId: user.id,
      studentId,
      attendedOn,
      report,
    });
  }

  return null;
}

export default function Index({
  loaderData: {
    session,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
    selectedStudentId,
    termYearsOptions,
    termsOptions,
    sessionDates,
    students,
    isNotMyReport,
    isReadOnlyEditor,
  },
}: Route.ComponentProps) {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);
  const editorStateRef = useRef<EditorState>(null);

  const signedOffOn = session?.signedOffOn;
  const completedOn = session?.completedOn;
  const reportFeedback = session?.reportFeedback;
  const isCancelled = session?.isCancelled;

  const isMyReport = !isNotMyReport;
  const canUnmarkReport = isMyReport && completedOn && !signedOffOn;

  const handleSelectedTermYearChange = () => {
    const formData = new FormData(formRef.current!);
    formData.set("selectedTermId", "");
    formData.set("selectedTermDate", "");
    formData.set("selectedStudentId", "");

    void submit(formData);
  };

  const handleSelectedTermChange = () => {
    const formData = new FormData(formRef.current!);
    formData.set("selectedTermDate", "");
    formData.set("selectedStudentId", "");

    void submit(formData);
  };

  const handleChange = () => {
    const formData = new FormData(formRef.current!);

    void submit(formData);
  };

  const saveReport = (actionType: ActionType) => () => {
    const formData = new FormData(formRef.current!);

    const studentId = formData.get("selectedStudentId")!.toString();
    const attendedOn = formData.get("selectedTermDate")!.toString();

    const resportState = editorStateRef.current!;

    if (isEditorEmpty(resportState)) {
      (
        document.getElementById("errorModalContent") as HTMLDivElement
      ).textContent = "Report cannot be blank.";
      (document.getElementById("errorModal") as HTMLDialogElement).showModal();
      return;
    }

    if (isSessionDateInTheFuture(attendedOn)) {
      (
        document.getElementById("errorModalContent") as HTMLDivElement
      ).textContent = "Session date is in the future.";
      (document.getElementById("errorModal") as HTMLDialogElement).showModal();
      return;
    }

    void submit(
      {
        actionType,
        sessionId: session?.id ?? null,
        studentId: Number(studentId),
        attendedOn,
        report: JSON.stringify(resportState.toJSON()),
      },
      { method: "POST", encType: "application/json" },
    );
  };

  return (
    <>
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex w-full items-center justify-between gap-8">
          <Title className={classNames({ "text-error": isCancelled })}>
            Report of &quot;
            {selectedTermDate && dayjs(selectedTermDate).format("DD/MM/YYYY")}
            &quot;
          </Title>

          {isCancelled && (
            <p className="text-error flex gap-4 font-medium">
              <InfoCircle />
              Session has been cancelled
            </p>
          )}

          <StateLink
            className="btn btn-error w-48 gap-2"
            to={`/mentor/students/${selectedStudentId}/report-to-admin`}
          >
            <WarningTriangle className="hidden h-4 w-4 lg:block" />
            Report to Admin
          </StateLink>
        </div>

        {isNotMyReport && session && (
          <p className="bg-info flex items-center gap-2 rounded-sm px-6 py-2">
            <WarningTriangle className="h-6 w-6" />
            Written By{" "}
            <span className="font-bold">
              {session.mentorSession.mentor.fullName}
            </span>
          </p>
        )}
      </div>

      <Form
        ref={formRef}
        key={`${selectedTermYear}-${selectedTermId}-${selectedTermDate}-${selectedStudentId}`}
        className="relative flex h-full flex-col"
      >
        <div className="mb-6 flex flex-col gap-2">
          <div key={selectedTermId} className="w-full">
            <label className="fieldset-label">Term</label>
            <div className="join w-full">
              <select
                data-testid="selectedTermYear"
                className="select join-item basis-28"
                name="selectedTermYear"
                defaultValue={selectedTermYear}
                onChange={handleSelectedTermYearChange}
              >
                {termYearsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                data-testid="selectedTermId"
                className="select join-item w-full"
                name="selectedTermId"
                defaultValue={selectedTermId}
                onChange={handleSelectedTermChange}
              >
                {termsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex content-center gap-6">
            {sessionDates.length > 0 ? (
              <div className="w-full">
                <Select
                  key={selectedTermDate}
                  label="Session date"
                  name="selectedTermDate"
                  defaultValue={selectedTermDate ?? ""}
                  options={sessionDates}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <p className="text-warning">
                No sessions booked for the selected term, go to{" "}
                <StateLink className="btn gap-2" to="/mentor/roster">
                  <Calendar /> Roster
                </StateLink>{" "}
                or include all dates
              </p>
            )}
          </div>

          <div>
            <Select
              key={selectedStudentId}
              label="Student"
              name="selectedStudentId"
              defaultValue={selectedStudentId}
              options={students.map(({ id, fullName }) => ({
                label: fullName,
                value: id.toString(),
              }))}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex h-full flex-row">
              <div
                className={classNames("w-full", {
                  "sm:w-3/4": !completedOn,
                  "w-full": completedOn,
                })}
              >
                <Editor
                  isReadonly={isReadOnlyEditor}
                  initialEditorStateType={session?.report ?? null}
                  onChange={(editorState) =>
                    (editorStateRef.current = editorState)
                  }
                />
              </div>

              {!completedOn && <EditorQuestions />}
            </div>

            <div className="flex justify-around gap-8 pb-2 sm:justify-end">
              {!completedOn && session !== null && !session.isCancelled && (
                <StateLink
                  to={`/mentor/sessions/${session.id}/student-absent`}
                  className="btn btn-error hidden h-9 gap-2 sm:flex sm:w-56"
                >
                  <UserXmark className="hidden h-4 w-4 lg:block" />
                  {isCancelled ? "View reason" : "Mark student absent"}
                </StateLink>
              )}

              <div className="flex flex-wrap gap-8">
                {!completedOn && (
                  <button
                    className="btn btn-success btn-block sm:w-56"
                    type="button"
                    onClick={saveReport("completed")}
                    disabled={isNotMyReport}
                  >
                    <CheckCircle />
                    Submit for review
                  </button>
                )}

                {canUnmarkReport && (
                  <button
                    className="btn btn-error btn-block sm:w-48"
                    type="button"
                    onClick={saveReport("remove-complete")}
                    disabled={isNotMyReport}
                  >
                    <WarningTriangle />
                    {isCancelled ? "Re enable session" : "Unmark completed"}
                  </button>
                )}
              </div>
            </div>

            {reportFeedback && <SubTitle>Admin Feedback</SubTitle>}
          </div>

          {reportFeedback && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex-1">
                <Editor
                  isReadonly
                  initialEditorStateType={reportFeedback}
                  onChange={(editorState) =>
                    (editorStateRef.current = editorState)
                  }
                />
              </div>

              <div className="flex items-center gap-4">
                <p className="text-info flex-1">
                  {signedOffOn
                    ? `Report has been signed off on ${dayjs(signedOffOn).format("MMMM D, YYYY")}`
                    : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </Form>

      <dialog id="errorModal" className="modal">
        <div className="modal-box">
          <h3 className="flex gap-2 text-lg font-bold">
            <WarningTriangle className="text-error" />
            Error
          </h3>
          <p className="py-4" id="errorModalContent"></p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
