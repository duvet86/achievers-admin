import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import type { EditorState } from "lexical";
import type { ActionType, SessionCommandRequest } from "./services.server";

import {
  Link,
  redirect,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router";

import { useRef } from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import {
  FloppyDiskArrowIn,
  CheckCircle,
  WarningTriangle,
  Calendar,
} from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, EditorQuestions, Select, SubTitle, Title } from "~/components";

import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getTermFromDate,
} from "~/services";
import {
  getSchoolTermsForYearAsync,
  getLoggedUserInfoAsync,
} from "~/services/.server";

import {
  geSessionAsync,
  getMentorSessionDatesAsync,
  getUserByAzureADIdAsync,
  saveReportAsync,
  getStudentsAsync,
  getSessionDatesFormatted,
} from "./services.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  let selectedTerm = url.searchParams.get("selectedTerm");
  let selectedTermDate = url.searchParams.get("selectedTermDate");
  let selectedStudentId = url.searchParams.get("selectedStudentId");

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  if (selectedTerm === null && selectedTermDate !== null) {
    selectedTerm = getTermFromDate(terms, selectedTermDate)?.name ?? null;
  }

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const students = await getStudentsAsync(user.id, user.chapterId);

  selectedStudentId = selectedStudentId ?? students[0].id.toString();

  const mentorBookedDates = await getMentorSessionDatesAsync(
    user.id,
    user.chapterId,
    currentTerm,
  );

  const sessionDatesFormatted = getSessionDatesFormatted(
    mentorBookedDates,
    currentTerm,
  );

  selectedTermDate =
    selectedTermDate ??
    getClosestSessionToToday(
      sessionDatesFormatted
        .filter(({ isBooked }) => isBooked)
        .map(({ value }) => new Date(value)),
    ) ??
    sessionDatesFormatted[0].value;

  if (selectedTermDate === null) {
    throw new Error();
  }

  const session = await geSessionAsync(
    user.id,
    Number(selectedStudentId),
    user.chapterId,
    selectedTermDate,
  );

  const isNotMyReport = session !== null && session.mentorId !== user.id;

  return {
    students,
    selectedTerm: selectedTerm ?? currentTerm.name,
    selectedTermDate,
    selectedStudentId,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${currentTerm.name === name ? " (Current)" : ""}`,
    })),
    sessionDates: sessionDatesFormatted,
    session,
    isNotMyReport,
    isReadOnlyEditor:
      session?.studentSession != null &&
      (session.studentSession.completedOn !== null ||
        session.studentSession.signedOffOn !== null ||
        isNotMyReport),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const type = bodyData.type;
  const sessionId = bodyData.sessionId;
  const studentSessionId = bodyData.studentSessionId;
  const studentId = bodyData.studentId;
  const attendedOn = bodyData.attendedOn;
  const report = bodyData.report;

  await saveReportAsync(
    type,
    sessionId,
    studentSessionId,
    user.id,
    user.chapterId,
    studentId,
    attendedOn,
    report,
  );

  return redirect(
    `/mentor/write-report?selectedTermDate=${attendedOn}&selectedStudentId=${studentId}`,
  );
}

export default function Index() {
  const {
    session,
    selectedTerm,
    selectedTermDate,
    selectedStudentId,
    termsList,
    sessionDates,
    students,
    isNotMyReport,
    isReadOnlyEditor,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const editorStateRef = useRef<EditorState>(null);
  const [searchParams] = useSearchParams();

  const studentSession = session?.studentSession;

  const signedOffOn = studentSession?.signedOffOn;
  const completedOn = studentSession?.completedOn;
  const reportFeedback = studentSession?.reportFeedback;

  const isMyReport = !isNotMyReport;
  const canUnmarkReport = isMyReport && completedOn && !signedOffOn;

  const handleSelectChange =
    (value: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      searchParams.set(value, event.target.value);
      void submit(`?${searchParams.toString()}`);
    };

  const saveReport = (type: ActionType) => () => {
    const studentId = (
      document.getElementById("selectedStudentId") as HTMLSelectElement
    ).value;
    const attendedOn = (
      document.getElementById("selectedTermDate") as HTMLSelectElement
    ).value;

    if (
      type !== "remove-complete" &&
      !confirm(
        `Please double check the date: ${dayjs(attendedOn).format("DD/MM/YYYY")}`,
      )
    ) {
      return;
    }

    void submit(
      {
        type,
        sessionId: session?.id ?? null,
        studentSessionId: studentSession?.id ?? null,
        studentId: Number(studentId),
        attendedOn,
        report: JSON.stringify(editorStateRef.current?.toJSON()),
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <div className="flex flex-col gap-10 lg:flex-row">
        <Title
          to={
            searchParams.get("back_url")
              ? searchParams.get("back_url")!
              : undefined
          }
          className="mb-4"
        >
          Report of &quot;
          {selectedTermDate && dayjs(selectedTermDate).format("DD/MM/YYYY")}
          &quot;
        </Title>

        {isNotMyReport && studentSession && (
          <p className="flex items-center gap-2 rounded bg-info px-6 py-2">
            <WarningTriangle className="h-6 w-6" />
            Written By{" "}
            <span className="font-bold">{session?.mentor.fullName}</span>
          </p>
        )}
      </div>

      <div className="relative flex h-full flex-col">
        <div className="mb-6 flex flex-col gap-2">
          <Select
            key={selectedTerm}
            label="Term"
            name="selectedTerm"
            defaultValue={selectedTerm}
            options={termsList}
            onChange={handleSelectChange("selectedTerm")}
          />

          <div className="flex content-center gap-6">
            {sessionDates.length > 0 ? (
              <Select
                key={selectedTermDate}
                label="Session date"
                name="selectedTermDate"
                defaultValue={selectedTermDate ?? ""}
                options={sessionDates}
                onChange={handleSelectChange("selectedTermDate")}
              />
            ) : (
              <p className="text-warning">
                No sessions booked for the selected term, go to{" "}
                <Link className="btn gap-2" to="/mentor/roster">
                  <Calendar /> Roster
                </Link>{" "}
                or include all dates
              </p>
            )}
          </div>

          <Select
            key={selectedStudentId}
            label="Student"
            name="selectedStudentId"
            defaultValue={selectedStudentId}
            options={students.map(({ id, fullName }) => ({
              label: fullName,
              value: id.toString(),
            }))}
            onChange={handleSelectChange("selectedStudentId")}
          />
        </div>

        <div
          key={selectedTerm + selectedTermDate + selectedStudentId}
          className="flex h-full flex-col gap-4"
        >
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
                  initialEditorStateType={studentSession?.report ?? null}
                  onChange={(editorState) =>
                    (editorStateRef.current = editorState)
                  }
                />
              </div>

              {!completedOn && <EditorQuestions />}
            </div>

            <div className="flex justify-around gap-4 pb-2 sm:justify-end">
              <div className="flex gap-8">
                {!completedOn && (
                  <>
                    <button
                      className="btn btn-primary w-36"
                      onClick={saveReport("draft")}
                      disabled={isNotMyReport}
                    >
                      <FloppyDiskArrowIn />
                      Save
                    </button>

                    <button
                      className="btn btn-success w-36"
                      onClick={saveReport("completed")}
                      disabled={isNotMyReport}
                    >
                      <CheckCircle />
                      Completed
                    </button>
                  </>
                )}

                {canUnmarkReport && (
                  <button
                    className="btn btn-error w-48"
                    onClick={saveReport("remove-complete")}
                    disabled={isNotMyReport}
                  >
                    <WarningTriangle />
                    Unmark completed
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
                <p className="flex-1 text-info">
                  {signedOffOn
                    ? `Report has been signed off on ${dayjs(signedOffOn).format("MMMM D, YYYY")}`
                    : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
