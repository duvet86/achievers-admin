import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Xmark } from "iconoir-react";

import { BackHeader } from "~/components";

import {
  getChapterByIdAsync,
  removeChapterFromUserAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(
    Number(params.userId),
    Number(params.chapterId),
  );

  return json({
    userId: params.userId,
    chapter,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.chapterId, "chapterId not found");

  await removeChapterFromUserAsync(
    Number(params.userId),
    Number(params.chapterId),
  );

  return redirect(`/admin/users/${params.userId}`);
}

export default function Assign() {
  const { userId, chapter } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <BackHeader to={`/admin/users/${userId}`} />

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <article className="prose max-w-none" data-testid="cofirmation-text">
            <h3>
              Are you sure you want to remove chapter "{chapter.chapter.name}"{" "}
              from user "{chapter.user.firstName} {chapter.user.lastName}"?
            </h3>
          </article>

          <div className="float-right">
            <button className="btn btn-error w-52 gap-5" type="submit">
              <Xmark className="h-6 w-6" />
              Remove
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
