import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";

import { getChapterByIdAsync } from "~/models/chapter.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(params.chapterId);
  invariant(chapter, "chapter not found");

  return json({ chapter });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const body = await request.formData();

  const name = body.get("countries");

  return json({ message: `Hello, ${name}` });
}

export default function Chapter() {
  const { chapter } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{chapter.name}</h3>
      <p className="py-6">{chapter.address}</p>

      <Form method="post">
        <label
          htmlFor="countries"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Select an option
        </label>
        <select
          name="countries"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          defaultValue=""
        >
          <option value="">Choose a country</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="FR">France</option>
          <option value="DE">Germany</option>
        </select>
        <p>{data ? data.message : ""}</p>

        <button
          type="submit"
          className="mt-4 rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </Form>

      <hr className="my-4" />

      <table className="w-full table-auto">
        <thead>
          <tr>
            <th align="left" className="p-2">
              Email
            </th>
            <th align="left" className="p-2">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {chapter.users.map(({ user }) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
