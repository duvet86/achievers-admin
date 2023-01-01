import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { Form, Link, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import { getAzureUserByIdAsync } from "~/models/azure.server";

import ButtonDanger from "~/components/ButtonDanger";
import { unassignMenteeFromMentorAsync } from "~/models/user.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.menteeId, "menteeId not found");

  const [mentor, mentee] = await Promise.all([
    getAzureUserByIdAsync(params.userId),
    getAzureUserByIdAsync(params.menteeId),
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
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">Unassign Mentee from Mentor</h1>
      <div className="mb-6">
        Are you sure you want to unassign the mentee{" "}
        <span className="font-medium">'{mentee.displayName}'</span> from the
        mentor <span className="font-medium">'{mentor.displayName}'</span>?
      </div>

      <div className="flex items-center space-x-6">
        <Link
          to="../../../"
          relative="path"
          className="flex w-24 items-center justify-center rounded border border-slate-300 bg-slate-200 px-4 py-2 hover:bg-slate-300"
        >
          <ArrowSmallLeftIcon className="mr-2 w-5" />
          <span>Back</span>
        </Link>
        <ButtonDanger type="submit">
          <XMarkIcon className="mr-2 w-5" />
          <span>Confirm</span>
        </ButtonDanger>
      </div>
    </Form>
  );
}
