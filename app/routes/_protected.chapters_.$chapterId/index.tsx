import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import { getChapterByIdAsync } from "~/services";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";
import ArrowSmallRightIcon from "@heroicons/react/24/solid/ArrowSmallRightIcon";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";

import Title from "~/components/Title";
import Input from "~/components/Input";

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
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      <Title>Edit chapter</Title>

      <Form method="post">
        <Input defaultValue={chapter.name} label="Name" name="name" />
        <Input defaultValue={chapter.address} label="Address" name="address" />

        <button className="btn-primary btn float-right mt-6 w-28" type="submit">
          Save
        </button>
      </Form>

      <hr className="my-6" />

      <div className="mb-6">
        <Link
          to="mentors"
          className="btn-success btn-outline btn mb-2 w-3/12 justify-around"
        >
          <UserGroupIcon className="h-6 w-6" />
          Go to the list of Users
          <ArrowSmallRightIcon className="h-6 w-6" />
        </Link>
      </div>

      <div>
        <Link
          to="mentees"
          className="btn-outline btn-info btn mb-2 w-3/12 justify-around"
        >
          <AcademicCapIcon className="h-6 w-6" />
          Go to the list of Mentees
          <ArrowSmallRightIcon className="h-6 w-6" />
        </Link>
      </div>
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
