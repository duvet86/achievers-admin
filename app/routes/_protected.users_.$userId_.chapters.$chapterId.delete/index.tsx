import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { Form, Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
} from "~/services";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import {
  unassignChapterFromUserAsync,
  getChapterByIdAsync,
} from "./services.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [user, chapter] = await Promise.all([
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
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
        <span className="font-medium">'{user.email}'</span>?
      </div>

      <div className="mt-6 flex items-center space-x-6">
        <Link to="../../../" relative="path" className="btn-ghost btn">
          <ArrowSmallLeftIcon className="mr-2 w-6" />
          <span>Back</span>
        </Link>
        <button className="btn-error btn gap-2">
          <XMarkIcon className="mr-2 w-6" />
          Confirm
        </button>
      </div>
    </Form>
  );
}
