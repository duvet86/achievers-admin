import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";

import { Title, Input, SubmitFormButton, StateLink } from "~/components";

import { getChapterByIdAsync } from "./services.server";
import { Calendar, Group } from "iconoir-react";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(Number(params.chapterId));

  return {
    chapter,
  };
}

export default function Index({
  loaderData: { chapter },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Edit chapter</Title>

      <Form method="post">
        <Input defaultValue={chapter.name} label="Name" name="name" />
        <Input defaultValue={chapter.address} label="Address" name="address" />

        <SubmitFormButton className="mt-6 justify-between" />
      </Form>

      <hr className="my-4" />

      <div className="join mt-4 w-1/3">
        <StateLink
          to="roster"
          className="btn btn-info join-item btn-xs h-12 w-full gap-2"
        >
          <Calendar className="h-4 w-4" />
          Go to roster
        </StateLink>
        <StateLink
          to="mentors"
          className="btn btn-warning join-item btn-xs h-12 w-full gap-2"
        >
          <Group className="h-4 w-4" />
          Go to mentors
        </StateLink>
      </div>
    </>
  );
}
