import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { UserXmark } from "iconoir-react";

import { Title, Textarea } from "~/components";

import { cancelSessionAsync, getSessionByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  return {
    session,
  };
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();

  await cancelSessionAsync(
    Number(params.sessionId),
    formData.get("reason") as string,
  );

  const url = new URL(request.url);

  const backUrl = url.searchParams.get("back_url");
  if (backUrl) {
    return redirect(backUrl);
  }

  return redirect(
    `/admin/sessions/${params.sessionId}?${url.searchParams.toString()}`,
  );
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backUrl = searchParams.get("back_url");

  return (
    <>
      <Title
        to={
          backUrl
            ? backUrl
            : `/admin/sessions/${session.id}?${searchParams.toString()}`
        }
        className="mb-4"
      >
        Cancel session of &quot;{dayjs(session.attendedOn).format("DD/MM/YYYY")}
        &quot;
      </Title>

      <p className="mb-2">
        Are you sure you want to cancel the session between the mentor{" "}
        <span className="font-bold">&quot;{session.user.fullName}&quot;</span>{" "}
        and the student{" "}
        <span className="font-bold">
          &quot;{session.student?.fullName}&quot;
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

        <div className="mt-4 flex justify-end">
          <button type="submit" className="btn btn-error w-56">
            <UserXmark className="h-6 w-6" /> Cancel session
          </button>
        </div>
      </Form>
    </>
  );
}
