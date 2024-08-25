import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { EditorState } from "lexical";
import type { ActionType, SessionCommandRequest } from "./services.server";

import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";

import { useRef } from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import { FloppyDiskArrowIn, CheckCircle, WarningTriangle } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, Select, SubTitle, Title } from "~/components";

import { getLoggedUserInfoAsync } from "~/services/.server/session.server";
import {
  getSchoolTermsForYearAsync,
  getSessionAsync,
  getUserByAzureADIdAsync,
  saveReportAsync,
  getCurrentTermForDate,
  getClosestSessionDate,
  getStudentsAsync,
  getTermFromDate,
} from "./services.server";
import { getDatesForTerm } from "~/services";

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

  const termsList = terms.map(({ start, end, name }) => ({
    value: name,
    label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${currentTerm.name === name ? " (Current)" : ""}`,
  }));

  const datesInTerm = getDatesForTerm(currentTerm.start, currentTerm.end).map(
    (sessionDate) => ({
      value: sessionDate,
      label: dayjs(sessionDate).format("DD/MM/YYYY"),
    }),
  );

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const students = await getStudentsAsync(user.id, user.chapterId);

  selectedTermDate = selectedTermDate ?? getClosestSessionDate();
  selectedStudentId = selectedStudentId ?? students[0].id.toString();

  const session = await getSessionAsync(
    user.id,
    Number(selectedStudentId),
    user.chapterId,
    selectedTermDate ?? getClosestSessionDate(),
  );

  return json({
    students,
    selectedTerm: selectedTerm ?? currentTerm.name,
    selectedTermDate,
    selectedStudentId,
    termsList,
    datesInTerm,
    session,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const type = bodyData.type;
  const sessionId = bodyData.sessionId;
  const studentId = bodyData.studentId;
  const attendedOn = bodyData.attendedOn;
  const report = bodyData.report;

  await saveReportAsync(
    type,
    sessionId,
    user.id,
    user.chapterId,
    studentId,
    attendedOn,
    report,
  );

  return null;
}

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const { data, state, load, submit } = useFetcher<typeof loader>();

  const editorStateRef = useRef<EditorState>();
  const [searchParams] = useSearchParams();

  const {
    session,
    selectedTerm,
    selectedTermDate,
    selectedStudentId,
    termsList,
    datesInTerm,
    students,
  } = data ?? initialData;

  const isLoading = state === "loading";
  const isReadOnlyEditor =
    session !== null &&
    (session?.completedOn !== null || session?.signedOffOn !== null);

  const handleChangeTerm = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTerm", event.target.value);
    load(`?${searchParams.toString()}`);
  };

  const handleChangeTermDate = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    searchParams.set("selectedTermDate", event.target.value);
    load(`?${searchParams.toString()}`);
  };

  const handleChangeStudent = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedStudentId", event.target.value);
    load(`?${searchParams.toString()}`);
  };

  const saveReport = (type: ActionType) => () => {
    const studentId = (
      document.getElementById("selectedStudentId") as HTMLSelectElement
    ).value;
    const attendedOn = (
      document.getElementById("selectedTermDate") as HTMLSelectElement
    ).value;

    submit(
      {
        type,
        studentId: Number(studentId),
        attendedOn,
        sessionId: session?.id ?? null,
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
      <Title
        to={
          searchParams.get("back_url")
            ? searchParams.get("back_url")!
            : undefined
        }
        className="mb-4"
      >
        Reports
      </Title>

      <div className="relative flex h-full flex-col">
        {isLoading && (
          <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-2">
          <Select
            label="Term"
            name="selectedTerm"
            defaultValue={searchParams.get("selectedTerm") ?? selectedTerm}
            options={termsList}
            onChange={handleChangeTerm}
          />
          <Select
            label="Session date"
            name="selectedTermDate"
            defaultValue={
              searchParams.get("selectedTermDate") ?? selectedTermDate
            }
            options={datesInTerm}
            onChange={handleChangeTermDate}
          />
          <Select
            label="Student"
            name="selectedStudentId"
            defaultValue={
              searchParams.get("selectedStudentId") ?? selectedStudentId
            }
            options={students.map(({ id, fullName }) => ({
              label: fullName,
              value: id.toString(),
            }))}
            onChange={handleChangeStudent}
          />
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex h-full flex-row">
              <div
                className={classNames({
                  "w-3/4": !session?.signedOffOn,
                  "w-full": session?.signedOffOn,
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

              {!session?.signedOffOn && (
                <div className="w-1/4 border-b pl-4">
                  <p className="font-semibold">
                    Have you answered these questions?
                  </p>
                  <hr className="my-2" />
                  <ul className="list-inside list-disc">
                    <li>What work did you cover this week?</li>
                    <li>What went well?</li>
                    <li>What could be improved on?</li>
                    <li>Any notes for next week for your partner mentor?</li>
                    <li>Any notes for your Chapter Coordinator?</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <div className="flex gap-8">
                {!session?.completedOn && (
                  <button
                    className="btn btn-primary w-44"
                    onClick={saveReport("draft")}
                  >
                    <FloppyDiskArrowIn className="h-6 w-6" />
                    Save as draft
                  </button>
                )}
                {!session?.completedOn && (
                  <button
                    className="btn btn-success w-48"
                    onClick={saveReport("completed")}
                  >
                    <CheckCircle className="h-6 w-6" />
                    Mark as completed
                  </button>
                )}

                {session?.completedOn && !session?.signedOffOn && (
                  <button
                    className="btn btn-error w-48"
                    onClick={saveReport("remove-complete")}
                  >
                    <WarningTriangle className="h-6 w-6" />
                    Unmark completed
                  </button>
                )}
              </div>
            </div>

            {session?.reportFeedback && <SubTitle>Admin Feedback</SubTitle>}
          </div>

          {session?.reportFeedback && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex-1">
                <Editor
                  isReadonly
                  initialEditorStateType={session.reportFeedback}
                  onChange={(editorState) =>
                    (editorStateRef.current = editorState)
                  }
                />
              </div>

              <div className="flex items-center gap-4">
                <p className="flex-1 text-info">
                  {session?.signedOffOn
                    ? `Report has been signed off on ${dayjs(session.signedOffOn).format("MMMM D, YYYY")}`
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
