import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import { Title, Input, BackHeader, SubmitFormButton } from "~/components";

import { getChapterByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(params.chapterId);

  return json({
    chapter,
  });
}

export default function ChapterId() {
  const { chapter } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>Edit chapter</Title>

      <Form method="post">
        <Input defaultValue={chapter.name} label="Name" name="name" />
        <Input defaultValue={chapter.address} label="Address" name="address" />

        <SubmitFormButton />
      </Form>
    </>
  );
}
