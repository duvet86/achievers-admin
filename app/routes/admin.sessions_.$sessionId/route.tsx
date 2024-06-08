import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { Xmark, Check, StatsReport, WarningCircle } from "iconoir-react";

import {
  Title,
  Select,
  SubTitle,
  SubmitFormButton,
  Textarea,
} from "~/components";

import {
  getMentorsForStudent,
  getSessionByIdAsync,
  updateSessionAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  const mentorsForStudent = await getMentorsForStudent(session.student.id);

  return json({
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
  const backURL = url.searchParams.get("backURL");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect("/admin/sessions");
}

export default function Index() {
  const {
    session: {
      chapter,
      user,
      student,
      attendedOn,
      isCancelled,
      reasonCancelled,
      hasReport,
      completedOn,
      signedOffOn,
    },
    mentorsForStudent,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("backURL");

  return (
    <>
      <div className="mb-4 flex justify-between">
        <Title to={backURL ? backURL : `/admin/sessions?${searchParams}`}>
          Session of &quot;{dayjs(attendedOn).format("MMMM D, YYYY")}&quot;
        </Title>

        {isCancelled ? (
          <div role="alert" className="alert alert-error w-72">
            <WarningCircle />
            <span>Session has been cancelled</span>
          </div>
        ) : (
          <div className="w-48">
            <Link
              to={`cancel?${searchParams}`}
              className="btn btn-error btn-block gap-2"
            >
              <Xmark className="h-6 w-6" /> Cancel session
            </Link>
          </div>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-8">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{student.fullName}</div>
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
                  to={`report?${searchParams}`}
                  className="btn btn-success gap-2"
                >
                  Go to report
                  <StatsReport className="h-6 w-6" />
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
              {completedOn && dayjs(completedOn).format("YYYY-MM-DD")}
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
              {signedOffOn && dayjs(signedOffOn).format("YYYY-MM-DD")}
            </div>
          </>
        )}
      </div>

      {!isCancelled && (
        <>
          <SubTitle>Update mentor</SubTitle>

          <Form method="post">
            <Select
              label="Mentor"
              name="mentorId"
              defaultValue={user.id.toString()}
              options={mentorsForStudent.map(({ user: { id, fullName } }) => ({
                label: fullName,
                value: id.toString(),
              }))}
            />

            <SubmitFormButton className="mt-6 justify-between" />
          </Form>
        </>
      )}
    </>
  );
}
