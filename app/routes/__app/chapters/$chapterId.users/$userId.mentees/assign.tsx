import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import type { MentoringStudent } from "@prisma/client";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import invariant from "tiny-invariant";

import { requireSessionUserAsync } from "~/session.server";
import { getAzureUsersAsync, Roles } from "~/models/azure.server";
import {
  assignMenteeFromMentorAsync,
  getStudentsMentoredByAsync,
} from "~/models/user.server";

import ButtonPrimary from "~/components/ButtonPrimary";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [azureUsers, mentoringStudents] = await Promise.all([
    getAzureUsersAsync(),
    getStudentsMentoredByAsync(params.userId),
  ]);

  const mentor = azureUsers.find(({ id }) => id === params.userId);
  invariant(mentor, "azureUser not found");

  const menteesLookUp = mentoringStudents.reduce<
    Record<string, MentoringStudent>
  >((res, value) => {
    res[value.studentId] = value;

    return res;
  }, {});

  const availableStudents = azureUsers
    .filter(({ id }) => menteesLookUp[id] === undefined)
    .filter(({ appRoleAssignments }) =>
      appRoleAssignments
        .map(({ appRoleId }) => appRoleId)
        .includes(Roles.Student)
    );

  return json({
    mentor,
    availableStudents,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.userId, "userId not found");

  const sessionUser = await requireSessionUserAsync(request);

  const formData = await request.formData();

  const menteeId = formData.get("menteeId");
  const frequencyInDays = formData.get("frequencyInDays");

  if (!menteeId || !frequencyInDays) {
    return json({
      error: "Select a Mentee and a Frequency please.",
    });
  }

  await assignMenteeFromMentorAsync(
    params.userId,
    menteeId.toString(),
    params.chapterId,
    Number(frequencyInDays),
    sessionUser.displayName
  );

  return redirect(`/chapters/${params.chapterId}/users/${params.userId}`);
}

export default function Assign() {
  const { mentor, availableStudents } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useTransition();

  const isSubmitting = transition.state === "submitting";

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">
        Assing Mentee to Mentor{" "}
        <span className="font-medium">'{mentor.displayName}'</span>
      </h1>

      <label
        htmlFor="menteeId"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Assign a Mentee
      </label>
      <select
        name="menteeId"
        className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        defaultValue=""
        disabled={isSubmitting}
      >
        <option value="">Select a Mentee</option>
        {availableStudents.map(({ id, displayName }) => (
          <option key={id} value={id}>
            {displayName}
          </option>
        ))}
      </select>

      <label
        htmlFor="frequency"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Select a Frequency
      </label>
      <select
        name="frequencyInDays"
        className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        defaultValue=""
        disabled={isSubmitting}
      >
        <option value="">Select a Frequency</option>
        <option value="7">Every Week</option>
        <option value="14">Quarterly</option>
      </select>

      <p className="mt-4 text-red-600">{actionData?.error}</p>

      <div className="flex items-center space-x-6">
        <Link
          to="../../"
          relative="path"
          className="mt-8 flex w-24 items-center justify-center space-x-2 rounded border border-zinc-300 bg-zinc-200 px-4 py-2 hover:bg-zinc-300"
          type="submit"
        >
          <ArrowSmallLeftIcon className="w-5" />
          <span>Back</span>
        </Link>
        <ButtonPrimary className="mt-8 w-24 space-x-2" type="submit">
          <PlusIcon className="w-5 text-white" />
          <span>Save</span>
        </ButtonPrimary>
      </div>
    </Form>
  );
}
