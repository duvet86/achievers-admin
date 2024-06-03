import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { ArrowLeft, UserXmark } from "iconoir-react";

import { Title, Textarea } from "~/components";

import { cancelSessionAsync, getSessionByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  return json({
    chapterId: params.chapterId,
    session,
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();

  await cancelSessionAsync(
    Number(params.sessionId),
    formData.get("reason")!.toString(),
  );

  return redirect(`/admin/chapters/${params.chapterId}/roster`);
}

export default function Index() {
  const { chapterId, session } = useLoaderData<typeof loader>();

  return (
    <>
      <Title classNames="mb-4">
        Cancel session of &quot;{dayjs(session.attendedOn).format("DD/MM/YYYY")}
        &quot;
      </Title>

      <p className="mb-2">
        Are you sure you want to cancel the session between the mentor{" "}
        <span className="font-bold">&quot;{session.user.lastName}&quot;</span>{" "}
        {session.user.lastName} and the student{" "}
        <span className="font-bold">
          &quot;{session.student.firstName} {session.student.lastName}&quot;
        </span>
        ?
      </p>

      <Form method="post">
        <Textarea
          label="Please add a reason"
          placeholder="Type here..."
          name="reason"
          required
        />

        <div className="mt-4 flex justify-end gap-6">
          <Link to={`/admin/chapters/${chapterId}/roster`} className="btn w-56">
            <ArrowLeft className="h-6 w-6" />
            Back
          </Link>

          <button type="submit" className="btn btn-error w-56">
            <UserXmark className="h-6 w-6" /> Cancel session
          </button>
        </div>
      </Form>
    </>
  );
}
