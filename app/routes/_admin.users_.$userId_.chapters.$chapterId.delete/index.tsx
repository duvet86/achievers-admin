import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { BackHeader, SubmitFormButton } from "~/components";

import {
  getChapterByIdAsync,
  removeChapterFromUserAsync,
} from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(
    Number(params.userId),
    Number(params.chapterId)
  );

  return json({
    chapter,
  });
}

export async function action({ params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  await removeChapterFromUserAsync(
    Number(params.userId),
    Number(params.chapterId)
  );

  return redirect(`/users/${params.userId}`);
}

export default function Assign() {
  const { chapter } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <BackHeader to="../../../" />

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <h1 className="mb-4 text-xl">
            Are you sure you want to remove chapter{" "}
            <span className="font-medium">'{chapter.chapter.name}'</span> from
            user{" "}
            <span className="font-medium">
              '{chapter.user.firstName} {chapter.user.lastName}'
            </span>
            ?
          </h1>

          <SubmitFormButton label="Remove" />
        </fieldset>
      </Form>
    </>
  );
}
