import type { LoaderArgs } from "@remix-run/server-runtime";
import type { AzureUserWithRole } from "~/services/azure.server";

import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getUserByIdAsync } from "~/services/user.server";
import { getAssignedChaptersToUserAsync } from "~/services/chapter.server";

import { getAzureUserWithRolesByIdAsync } from "~/services/azure.server";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import Input from "~/components/Input";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  let azureUser: AzureUserWithRole;
  try {
    azureUser = await getAzureUserWithRolesByIdAsync(params.userId);
  } catch (error) {
    throw redirect("/logout");
  }

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
    <div className="flex">
      <Form method="post" className="flex-1">
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
        <Input defaultValue={user?.mobile || ""} label="Mobile" name="mobile" />
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

        <p className="py-2">
          Role:{" "}
          {user.appRoleAssignments.length > 0 ? (
            user.appRoleAssignments.map(({ roleName }) => roleName).join(", ")
          ) : (
            <i>No roles assigned</i>
          )}
        </p>
      </Form>

      <div className="w-2/5">
        <div className="overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Assigned to
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
                    <span>{name}</span>
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

        <div className="mt-6 flex justify-end space-x-6">
          <Link to="../" relative="path" className="btn-ghost btn gap-2">
            <ArrowSmallLeftIcon className="w-6" />
            Back
          </Link>
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
