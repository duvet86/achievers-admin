import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { Form, Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getAzureUserByIdAsync } from "~/models/azure.server";
import { getChapterByIdAsync } from "~/models/chapter.server";
import { unassignChapterFromUserAsync } from "~/models/user.server";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import ButtonDanger from "~/components/ButtonDanger";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  const [user, chapter] = await Promise.all([
    getAzureUserByIdAsync(params.userId),
    getChapterByIdAsync(params.chapterId),
  ]);

  return json({
    user,
    chapter,
  });
}

export async function action({ params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  await unassignChapterFromUserAsync(params.userId, params.chapterId);

  return redirect(`/users/${params.userId}`);
}

export default function Delete() {
  const { user, chapter } = useLoaderData<typeof loader>();

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">Unassign Chapter from User</h1>
      <div className="mb-6">
        Are you sure you want to unassign the chapter{" "}
        <span className="font-medium">'{chapter.name}'</span> from the user{" "}
        <span className="font-medium">'{user.displayName}'</span>?
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
