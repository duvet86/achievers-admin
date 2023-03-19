import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
} from "~/services";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";

import { unassignMenteeFromMentorAsync } from "./services.server";
import BackHeader from "~/components/BackHeader";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.menteeId, "menteeId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [mentor, mentee] = await Promise.all([
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.menteeId),
  ]);

  return json({
    mentor,
    mentee,
  });
}

export async function action({ params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");
  invariant(params.menteeId, "menteeId not found");

  await unassignMenteeFromMentorAsync(
    params.userId,
    params.menteeId,
    params.chapterId
  );

  return redirect(`/chapters/${params.chapterId}/users/${params.userId}`);
}

export default function MenteesDelete() {
  const { mentor, mentee } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to="../../../" />

      <Form method="post">
        <h1 className="mb-4 text-xl font-medium">
          Unassign Mentee from Mentor
        </h1>
        <div className="mb-6">
          Are you sure you want to unassign the mentee{" "}
          <span className="font-medium">'{mentee.email}'</span> from the mentor{" "}
          <span className="font-medium">'{mentor.email}'</span>?
        </div>

        <div className="mt-6">
          <button className="btn-error btn gap-2">
            <XMarkIcon className="mr-2 w-6" />
            Confirm
          </button>
        </div>
      </Form>
    </>
  );
}
