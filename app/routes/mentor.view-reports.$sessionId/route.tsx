import type { Route } from "./+types/route";

import { Fragment } from "react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { InfoCircle, NavArrowLeft, NavArrowRight } from "iconoir-react";
import classNames from "classnames";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, Select, StateLink, SubTitle, Title } from "~/components";

import {
  getCancelReasons,
  getNextSession,
  getPreviousSession,
  getSessionAsync,
  getSignedOffBy,
} from "./services.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  const [signedOffBy, nextSession, prevSession] = await Promise.all([
    session.signedOffByAzureId
      ? getSignedOffBy(session.signedOffByAzureId)
      : Promise.resolve(null),
    getNextSession(session.studentSession.student.id, session.attendedOn),
    getPreviousSession(session.studentSession.student.id, session.attendedOn),
  ]);

  const cancelReasons = session?.cancelledReasonId
    ? await getCancelReasons()
    : [];

  return {
    session,
    cancelReasonsOptions: cancelReasons.map(({ id, reason }) => ({
      label: reason,
      value: id.toString(),
    })),
    signedOffBy,
    nextSession,
    prevSession,
  };
}

export default function Index({
  loaderData: {
    session,
    cancelReasonsOptions,
    signedOffBy,
    nextSession,
    prevSession,
  },
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex w-full items-center justify-between gap-8">
        <Title className={classNames({ "text-error": session.isCancelled })}>
          Report of &quot;
          {dayjs(session.attendedOn).format("DD/MM/YYYY")}
          &quot;
        </Title>

        {session.isCancelled && (
          <p className="text-error flex gap-2 font-medium">
            <InfoCircle />
            Session has been cancelled
          </p>
        )}
      </div>

      <hr className="my-2" />

      <div className="mt-2 flex items-center justify-between">
        {prevSession ? (
          <StateLink
            to={`/mentor/view-reports/${prevSession.id}`}
            className="btn btn-square btn-secondary w-28"
          >
            <NavArrowLeft /> Previous
          </StateLink>
        ) : (
          <div className="w-28"></div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <h3 className="my-4 font-bold">Student:</h3>
          <p>{session.studentSession.student.fullName}</p>
        </div>

        {nextSession ? (
          <StateLink
            to={`/mentor/view-reports/${nextSession.id}`}
            className="btn btn-square btn-secondary w-28"
          >
            Next <NavArrowRight />
          </StateLink>
        ) : (
          <div className="w-28"></div>
        )}
      </div>

      {session?.cancelledReasonId && (
        <div className="mt-2 rounded border">
          <Select
            name="cancelledReasonId"
            options={cancelReasonsOptions}
            defaultValue={session.cancelledReasonId.toString() ?? ""}
            disabled
          />
        </div>
      )}

      <Fragment key={session.id}>
        <SubTitle>Report</SubTitle>
        <div className="mb-1 flex gap-2">
          <h3 className="font-bold">Written by mentor:</h3>
          <p>{session.mentorSession.mentor.fullName}</p>
        </div>
        <Editor isReadonly initialEditorStateType={session.report} />

        {!session.isCancelled && signedOffBy && (
          <>
            <SubTitle>Feedback</SubTitle>
            <div className="mb-1 flex gap-2">
              <h3 className="font-bold">Signed by:</h3>
              <p>{signedOffBy.fullName}</p>
            </div>
            <Editor
              isReadonly
              initialEditorStateType={session.reportFeedback}
            />
          </>
        )}
      </Fragment>
    </>
  );
}
