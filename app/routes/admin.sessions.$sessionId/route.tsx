import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  Xmark,
  Check,
  StatsReport,
  WarningCircle,
  EditPencil,
} from "iconoir-react";

import { Title, SubmitFormButton, Textarea, SelectSearch } from "~/components";

import {
  getMentorsForStudent,
  getSessionByIdAsync,
  updateSessionAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  const mentorsForStudent = await getMentorsForStudent(
    session.chapterId,
    session.student.id,
  );

  return json({
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    session,
    mentorsForStudent,
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();

  await updateSessionAsync(
    Number(params.sessionId),
    Number(formData.get("mentorId")),
  );

  const url = new URL(request.url);
  const backURL = url.searchParams.get("back_url");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect("/admin/sessions");
}

export default function Index() {
  const {
    attendedOnLabel,
    session: {
      id,
      chapter,
      user,
      student,
      isCancelled,
      reasonCancelled,
      hasReport,
      completedOn,
      signedOffOn,
    },
    mentorsForStudent,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <div className="flex justify-between">
        <Title
          to={backURL ? backURL : `/admin/sessions?${searchParams.toString()}`}
        >
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        {isCancelled ? (
          <div role="alert" className="alert alert-error w-72">
            <WarningCircle />
            <span>Session has been cancelled</span>
          </div>
        ) : completedOn ? null : (
          <Link
            to={`cancel?${searchParams.toString()}`}
            className="btn btn-error w-48 gap-2"
          >
            <Xmark className="h-6 w-6" /> Cancel session
          </Link>
        )}
      </div>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{student.fullName}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Mentor</div>
          {!isCancelled && (
            <Form className="flex flex-1 items-end gap-4" method="post">
              <SelectSearch
                name="mentorId"
                defaultValue={user.id.toString()}
                options={mentorsForStudent.map(({ id, fullName }) => ({
                  label: fullName,
                  value: id.toString(),
                }))}
                disabled={!!completedOn}
                required
              />

              {!completedOn && <SubmitFormButton label="Update" />}
            </Form>
          )}
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-2 p-2">
            <div className="w-72 font-bold">Reason</div>
            <Textarea readOnly defaultValue={reasonCancelled!} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b p-2">
              <div className="w-72 font-bold">Has report?</div>
              <div className="flex-1">
                {hasReport ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <Xmark className="h-6 w-6 text-error" />
                )}
              </div>
              {hasReport && (
                <Link
                  to={`report?${searchParams.toString()}`}
                  className="btn btn-success gap-2"
                >
                  <StatsReport /> Go to report
                </Link>
              )}
              {!hasReport && user.id && (
                <Link
                  to={`/admin/sessions/${id}/mentors/${user.id}/write-report`}
                  className="btn btn-success gap-2"
                >
                  <EditPencil /> Write report on behalf
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 border-b p-2">
              <div className="w-72 font-bold">Is report completed?</div>
              <div className="flex-1">
                {completedOn ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <Xmark className="h-6 w-6 text-error" />
                )}
              </div>
              {completedOn && dayjs(completedOn).format("MMMM D, YYYY")}
            </div>
            <div className="flex items-center gap-2 border-b p-2">
              <div className="w-72 font-bold">Is report signed off?</div>
              <div className="flex-1">
                {signedOffOn ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <Xmark className="h-6 w-6 text-error" />
                )}
              </div>
              {signedOffOn && dayjs(signedOffOn).format("MMMM D, YYYY")}
            </div>
          </>
        )}
      </div>
    </>
  );
}
