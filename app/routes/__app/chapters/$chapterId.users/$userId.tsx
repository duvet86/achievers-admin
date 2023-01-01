import type { MentoringStudent } from "@prisma/client";
import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from "@remix-run/server-runtime";
import type { AssignStudentToMentor } from "~/models/user.server";
import type { AzureUser } from "~/models/azure.server";

import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { useState } from "react";
import invariant from "tiny-invariant";

import { PlusIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

import { getSessionUserAsync } from "~/session.server";

import { getAzureUsersAsync, Roles } from "~/models/azure.server";
import { getAssignedChaptersToUserAsync } from "~/models/chapter.server";
import {
  assignStudentToMentorAsync,
  getStudentsMentoredByAsync,
} from "~/models/user.server";

import ButtonPrimary from "~/components/ButtonPrimary";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [azureUsers, mentoredStudents, assignedChapters] = await Promise.all([
    getAzureUsersAsync(),
    getStudentsMentoredByAsync(params.userId),
    getAssignedChaptersToUserAsync(params.userId),
  ]);

  const azureUser = azureUsers.find(({ id }) => id === params.userId);
  invariant(azureUser, "azureUser not found");

  const menteesLookUp = mentoredStudents.reduce<
    Record<string, MentoringStudent>
  >((res, value) => {
    res[value.studentId] = value;

    return res;
  }, {});

  const azureMentees = azureUsers
    .filter(({ id }) => menteesLookUp[id] !== undefined)
    .map((azureUser) => ({
      ...azureUser,
      frequencyInDays: menteesLookUp[azureUser.id].frequencyInDays,
    }));

  const availableStudents = azureUsers
    .filter(({ id }) => menteesLookUp[id] === undefined)
    .filter(({ appRoleAssignments }) =>
      appRoleAssignments
        .map(({ appRoleId }) => appRoleId)
        .includes(Roles.Student)
    )
    .map((azureUser) => ({
      ...azureUser,
      frequencyInDays: menteesLookUp[azureUser.id].frequencyInDays,
    }));

  return json({
    user: {
      ...azureUser,
      mentoringStudents: azureMentees,
    },
    availableStudents,
    assignedChapters,
  });
}

export async function action({ request, params }: ActionArgs): Promise<
  TypedResponse<{
    error: string | undefined;
  }>
> {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);
  invariant(sessionUser, "sessionUser not found");

  const urlSearchParams = new URLSearchParams(await request.text());

  const studentIds = urlSearchParams.getAll("studentIds");
  invariant(studentIds, "studentIds not found");

  const updateUser: AssignStudentToMentor = {
    mentorId: params.userId,
    studentIds,
    chapterId: params.chapterId,
  };

  await assignStudentToMentorAsync(updateUser, sessionUser.id);

  return json({ error: undefined });
}

export default function ChapterUser() {
  const {
    user: initialUser,
    availableStudents: initialAvailableStudents,
    assignedChapters,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();

  const [user, setUser] = useState<typeof initialUser>(initialUser);
  const [availableStudents, setAvailableStudents] = useState<
    typeof initialAvailableStudents
  >(initialAvailableStudents);

  const isSubmitting = transition.state === "submitting";

  const removeStudent = (studentId: AzureUser["id"]) => () => {
    if (isSubmitting) {
      return;
    }

    const studentToRemove = user.mentoringStudents.find(
      ({ id }) => id === studentId
    );
    invariant(studentToRemove);

    setAvailableStudents((state) => [...state, studentToRemove]);

    setUser((state) => ({
      ...state,
      mentoringStudents: state.mentoringStudents.filter(
        (student) => student.id !== studentToRemove.id
      ),
    }));
  };

  const assignStudent = (studentId: AzureUser["id"]) => {
    if (isSubmitting) {
      return;
    }

    const studentToAdd = availableStudents.find(({ id }) => id === studentId);
    invariant(studentToAdd);

    setAvailableStudents((state) =>
      state.filter(({ id }) => id !== studentToAdd.id)
    );

    setUser((state) => ({
      ...state,
      mentoringStudents: [...state.mentoringStudents, studentToAdd],
    }));
  };

  return (
    <div>
      <h3 className="text-2xl font-bold">{user.userPrincipalName}</h3>
      <p className="mt-4 py-2">Email: {user.mail ?? "-"}</p>
      <p className="py-2">
        Role:{" "}
        {user.appRoleAssignments.length > 0 ? (
          user.appRoleAssignments.map(({ roleName }) => roleName).join(", ")
        ) : (
          <i>No roles assigned</i>
        )}
      </p>
      <p>
        Assigned Chapter:{" "}
        {assignedChapters.map(({ chapter: { name } }) => name).join(", ")}
      </p>

      <hr className="my-4" />

      <Form method="post" className="mt-4">
        <div className="rounded bg-gray-100 px-2 py-6">
          <label
            htmlFor="addChapter"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Select a Student
          </label>
          <select
            className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            defaultValue=""
            onChange={(event) => {
              assignStudent(event.target.value);
              event.target.value = "";
            }}
            disabled={isSubmitting}
          >
            <option value="">Assign a Student</option>
            {availableStudents.map(({ id, userPrincipalName }) => (
              <option key={id} value={id}>
                {userPrincipalName}
              </option>
            ))}
          </select>

          <label
            htmlFor="addChapter"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Select a Frequency
          </label>
          <select
            className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            defaultValue=""
            onChange={(event) => {
              assignStudent(event.target.value);
              event.target.value = "";
            }}
            disabled={isSubmitting}
          >
            <option value="7">Every Week</option>
            <option value="14">Quarterly</option>
          </select>

          <ButtonPrimary className="my-6 w-24 space-x-2" type="submit">
            <PlusIcon className="w-5 text-white" />
            <span>Add</span>
          </ButtonPrimary>

          <div className="overflow-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Mentee
                  </th>
                  <th align="left" className="p-2">
                    Frequency
                  </th>
                  <th align="right" className="p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.mentoringStudents.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No Students assigned to this Mentor</i>
                    </td>
                  </tr>
                )}
                {user.mentoringStudents.map(
                  ({ id, userPrincipalName, frequencyInDays }) => (
                    <tr key={id}>
                      <td className="border p-2">
                        <span>{userPrincipalName}</span>
                        <input type="hidden" name="studentIds" value={id} />
                      </td>
                      <td className="border p-2">
                        <span>Every {frequencyInDays} days</span>
                        <input type="hidden" name="frequencies" value={id} />
                      </td>
                      <td align="right" className="border p-2">
                        <button
                          onClick={removeStudent(id)}
                          className="flex items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                        >
                          <XMarkIcon className="mr-2 w-5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-red-900">{actionData?.error}</p>

        <div className="flex items-center space-x-6">
          <Link
            to="."
            className="mt-8 flex w-24 items-center justify-center space-x-2 rounded border border-zinc-300 bg-zinc-200 px-4 py-2 hover:bg-zinc-300"
            type="submit"
          >
            <ArrowPathIcon className="w-5" />
            <span>Reset</span>
          </Link>
          <ButtonPrimary className="mt-8 w-24 space-x-2" type="submit">
            <PlusIcon className="w-5 text-white" />
            <span>Save</span>
          </ButtonPrimary>
        </div>
      </Form>
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
