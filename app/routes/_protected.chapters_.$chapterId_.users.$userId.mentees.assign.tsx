import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getSessionUserAsync } from "~/session.server";
import { getAzureUserWithRolesByIdAsync, Roles } from "~/services/azure.server";
import {
  assignMenteeFromMentorAsync,
  getMenteesMentoredByAsync,
} from "~/services/mentoring.server";
import { getMenteesInChapterAsync } from "~/services/mentee.server";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [azureUser, currentMentoredMentees, allMenteesInChapter] =
    await Promise.all([
      getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
      getMenteesMentoredByAsync(params.userId),
      getMenteesInChapterAsync(params.chapterId),
    ]);

  if (
    azureUser.appRoleAssignments.find(
      ({ appRoleId }) => appRoleId === Roles.Mentor
    ) === undefined
  ) {
    throw new Error("Selected user is not a mentor.");
  }

  const currentMentoredMenteesLookup = currentMentoredMentees.reduce<
    Record<string, boolean>
  >((res, { menteeId }) => {
    res[menteeId] = true;
    return res;
  }, {});

  const availableMentees = allMenteesInChapter.filter(
    ({ id }) => !currentMentoredMenteesLookup[id]
  );

  return json({
    mentor: azureUser,
    currentMentoredMentees,
    availableMentees,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const menteeId = formData.get("menteeId");
  const frequencyInDays = formData.get("frequencyInDays");
  const startDate = formData.get("startDate");
  const assignedBy = formData.get("assignedBy");

  if (!menteeId || !frequencyInDays || !startDate || !assignedBy) {
    return json({
      error: "Select a Mentee, a Frequency and a Start Date please.",
    });
  }

  await assignMenteeFromMentorAsync(
    params.userId,
    menteeId.toString(),
    params.chapterId,
    Number(frequencyInDays),
    dayjs(startDate.toString(), "YYYY-MM-DD").toDate(),
    assignedBy.toString()
  );

  return redirect(`/chapters/${params.chapterId}/users/${params.userId}`);
}

export default function Assign() {
  const { mentor, availableMentees } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useTransition();

  const isSubmitting = transition.state === "submitting";

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">
        Assign Mentee to Mentor{" "}
        <span className="font-medium">'{mentor.email}'</span>
      </h1>

      <input type="hidden" name="assignedBy" value={mentor.email} />

      <label
        htmlFor="menteeId"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Mentee
      </label>
      <select
        name="menteeId"
        className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        defaultValue=""
        disabled={isSubmitting}
      >
        <option value="">Select a Mentee</option>
        {availableMentees.map(({ id, firstName, lastName }) => (
          <option key={id} value={id}>
            {firstName} {lastName}
          </option>
        ))}
      </select>

      <label
        htmlFor="frequency"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Frequency
      </label>
      <select
        name="frequencyInDays"
        className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        defaultValue=""
        disabled={isSubmitting}
      >
        <option value="">Select a Frequency</option>
        <option value="7">Every Week</option>
        <option value="14">Quarterly</option>
      </select>

      <label
        htmlFor="startDate"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Start Date
      </label>
      <input
        className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        type="date"
        name="startDate"
        defaultValue={dayjs().format("YYYY-MM-DD")}
        min={dayjs().format("YYYY-MM-DD")}
      />

      <p className="mt-4 text-red-600">{actionData?.error}</p>

      <div className="mt-6 flex items-center space-x-6">
        <Link
          to="../../"
          relative="path"
          className="btn-ghost btn gap-2"
          type="submit"
        >
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
        <button className="btn gap-2">
          <PlusIcon className="w-6 text-white" />
          Save
        </button>
      </div>
    </Form>
  );
}
