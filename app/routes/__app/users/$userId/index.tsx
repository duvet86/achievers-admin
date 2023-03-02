import type { LoaderArgs } from "@remix-run/server-runtime";

import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getUserByIdAsync } from "~/services/user.server";
import { getAssignedChaptersToUserAsync } from "~/services/chapter.server";

import { getAzureUserWithRolesByIdAsync } from "~/services/azure.server";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import Input from "~/components/Input";
import Title from "~/components/Title";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const azureUser = await getAzureUserWithRolesByIdAsync(params.userId);

  const [user, assignedChapters] = await Promise.all([
    getUserByIdAsync(params.userId),
    getAssignedChaptersToUserAsync(params.userId),
  ]);

  return json({
    user: {
      ...azureUser,
      ...user,
      assignedChapters,
    },
  });
}

export default function Chapter() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      <Title>Edit user info</Title>

      <div className="flex">
        <Form
          method="post"
          className="mr-8 flex-1 border-r border-primary pr-4"
        >
          <Input
            defaultValue={user?.firstName || ""}
            label="First name"
            name="firstName"
          />
          <Input
            defaultValue={user?.lastName || ""}
            label="Last name"
            name="lastName"
          />
          <Input
            defaultValue={user?.email || ""}
            label="Email"
            name="email"
            readOnly={Boolean(user?.email)}
          />
          <Input
            defaultValue={user?.additionalEmail || ""}
            label="Additional email"
            name="additionalEmail"
            readOnly={Boolean(user?.additionalEmail)}
          />
          <Input
            defaultValue={user?.mobile || ""}
            label="Mobile"
            name="mobile"
          />
          <Input
            defaultValue={user?.address || ""}
            label="Address"
            name="address"
          />
          <Input
            defaultValue={user?.dateOfBirth || ""}
            label="Date of birth"
            name="dateOfBirth"
            type="date"
          />

          <button
            className="btn-primary btn float-right mt-6 w-28"
            type="submit"
          >
            Save
          </button>
        </Form>

        <div className="flex-1">
          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Roles
                  </th>
                  <th align="right" className="p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.appRoleAssignments.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No Roles assigned to this user</i>
                    </td>
                  </tr>
                )}
                {user.appRoleAssignments.map(({ id, roleName }) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <span className="font-semibold">{roleName}</span>
                      <input type="hidden" name="roleIds" value={id} />
                    </td>
                    <td align="right" className="border p-2">
                      <Link
                        to={`roles/${id}/delete`}
                        className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                      >
                        <XMarkIcon className="mr-2 w-5" />
                        <span>Remove</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="my-6 flex justify-end">
            <Link
              to="roles/assign"
              relative="path"
              className="btn-primary btn gap-2"
            >
              <PlusIcon className="w-6" />
              Assign a Role
            </Link>
          </div>

          <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Assigned to Chapter
                  </th>
                  <th align="right" className="p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.assignedChapters.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No Chapters assigned to this user</i>
                    </td>
                  </tr>
                )}
                {user.assignedChapters.map(({ chapter: { id, name } }) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <span className="font-semibold">{name}</span>
                      <input type="hidden" name="chapterIds" value={id} />
                    </td>
                    <td align="right" className="border p-2">
                      <Link
                        to={`chapters/${id}/delete`}
                        className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                      >
                        <XMarkIcon className="mr-2 w-5" />
                        <span>Remove</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="chapters/assign"
              relative="path"
              className="btn-primary btn gap-2"
            >
              <PlusIcon className="w-6" />
              Assign to a Chapter
            </Link>
          </div>
        </div>
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
