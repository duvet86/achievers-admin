import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from "@remix-run/server-runtime";
import type { AssignStudentToMentor } from "~/models/user.server";
import type { AzureUser } from "~/models/azure.server";

import { assignStudentToMentorAsync } from "~/models/user.server";

import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { useState } from "react";
import invariant from "tiny-invariant";

import { XMarkIcon } from "@heroicons/react/24/solid";

import { getSessionUserAsync } from "~/session.server";

import { getAzureUsersAsync, Roles } from "~/models/azure.server";
import { getStudentsMentoredByAsync } from "~/models/mentoring.server";
import { getAssignedChaptersToUserAsync } from "~/models/chapter.server";

import LoadingButton from "~/components/LoadingButton";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [azureUsers, mentoredStudents, assignedChapters] = await Promise.all([
    getAzureUsersAsync(),
    getStudentsMentoredByAsync(params.userId),
    getAssignedChaptersToUserAsync(params.userId),
  ]);

  const azureUser = azureUsers.find(({ id }) => id === params.userId);
  invariant(azureUser, "azureUser not found");

  const mentoredStudentIds = mentoredStudents.map(({ studentId }) => studentId);

  const azureMentoredStudents = azureUsers.filter(({ id }) =>
    mentoredStudentIds.includes(id)
  );

  const availableStudents = azureUsers.filter(
    ({ id, appRoleAssignments }) =>
      appRoleAssignments
        .map(({ appRoleId }) => appRoleId)
        .includes(Roles.Student) &&
      azureMentoredStudents.map(({ id: studentId }) => id !== studentId)
  );

  return json({
    user: {
      ...azureUser,
      mentoringStudents: azureMentoredStudents,
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
        <div className="rounded bg-gray-200 p-2">
          <label
            htmlFor="addChapter"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Select a Student
          </label>
          <select
            name="addChapter"
            className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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

          <div className="overflow-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Mentors
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
                {user.mentoringStudents.map(({ id, userPrincipalName }) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <span>{userPrincipalName}</span>
                      <input type="hidden" name="studentIds" value={id} />
                    </td>
                    <td align="right" className="border p-2">
                      <button onClick={removeStudent(id)}>
                        <XMarkIcon className="mr-4 w-6 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-red-900">{actionData?.error}</p>

        <LoadingButton className="mt-8" type="submit">
          Save
        </LoadingButton>
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
