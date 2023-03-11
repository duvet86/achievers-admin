import type { LoaderArgs } from "@remix-run/server-runtime";
import type { ActionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  Link,
  useCatch,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import invariant from "tiny-invariant";

import { getChapterByIdAsync, readFormDataAsStringsAsync } from "~/services";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";

import Title from "~/components/Title";
import Input from "~/components/Input";
import Select from "~/components/Select";

import { createNewMentee } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(params.chapterId);

  return json({
    chapter,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const formValues = await readFormDataAsStringsAsync(request);

  await createNewMentee({
    chapterId: params.chapterId,
    firstName: formValues["firstName"],
    lastName: formValues["lastName"],
    yearLevel: formValues["yearLevel"],
  });

  return redirect(`/chapters/${params.chapterId}/mentees`);
}

export default function ChapterId() {
  const transition = useNavigation();
  const { chapter } = useLoaderData<typeof loader>();

  return (
    <>
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      <Title>New Mentee at Chapter "{chapter.name}"</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <Input label="First name" name="firstName" required />

          <Input label="Last name" name="lastName" required />

          <Select
            label="Yeat level"
            name="yearLevel"
            options={[
              { label: "Select a Year level", value: "" },
              { label: "Year 1", value: "year1" },
              { label: "Year 2", value: "year2" },
              { label: "Year 3", value: "year3" },
              { label: "Year 4", value: "year4" },
              { label: "Year 5", value: "year5" },
              { label: "Year 6", value: "year6" },
            ]}
            required
          />

          <button
            className="btn-primary btn float-right mt-6 w-28 gap-2"
            type="submit"
          >
            <PlusIcon className="h-6 w-6" />
            Save
          </button>
        </fieldset>
      </Form>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
