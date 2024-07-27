/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { ArrowLeft, UserXmark } from "iconoir-react";

import { Title, Textarea } from "~/components";

import { cancelSessionAsync, getSessionByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  return json({
    session,
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();

  await cancelSessionAsync(
    Number(params.sessionId),
    formData.get("reason")!.toString(),
  );

  const url = new URL(request.url);

  return redirect(`/admin/sessions/${params.sessionId}?${url.searchParams}`);
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Title className="mb-4">
        Cancel session of &quot;{dayjs(session.attendedOn).format("DD/MM/YYYY")}
        &quot;
      </Title>

      <p className="mb-2">
        Are you sure you want to cancel the session between the mentor{" "}
        <span className="font-bold">&quot;{session.user.fullName}&quot;</span>{" "}
        and the student{" "}
        <span className="font-bold">
          &quot;{session.student.fullName}&quot;
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
          <Link
            to={`/admin/sessions/${session.id}?${searchParams}`}
            className="btn w-48"
          >
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
