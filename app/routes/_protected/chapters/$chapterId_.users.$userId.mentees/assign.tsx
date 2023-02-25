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
import dayjs from "dayjs";

import { requireSessionUserAsync } from "~/session.server";
import { getAzureUsersAsync, Roles } from "~/models/azure.server";
import {
  assignMenteeFromMentorAsync,
  getMenteesMentoredByAsync,
} from "~/models/user.server";

export async function loader({ params }: LoaderArgs) {
  try {
    invariant(params.userId, "userId not found");

    const [azureUsers, mentoringStudents] = await Promise.all([
      getAzureUsersAsync(),
      getMenteesMentoredByAsync(params.userId),
    ]);

    const mentor = azureUsers.find(({ id }) => id === params.userId);
    invariant(mentor, "azureUser not found");

    const menteesLookUp = mentoringStudents.reduce<
      Record<string, MentoringStudent>
    >((res, value) => {
      res[value.menteeId] = value;

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
  } catch (error) {
    throw redirect("/logout");
  }
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.userId, "userId not found");

  const sessionUser = await requireSessionUserAsync(request);

  const formData = await request.formData();

  const menteeId = formData.get("menteeId");
  const frequencyInDays = formData.get("frequencyInDays");
  const startDate = formData.get("startDate");

  if (!menteeId || !frequencyInDays || !startDate) {
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
        Assign Mentee to Mentor{" "}
        <span className="font-medium">'{mentor.displayName}'</span>
      </h1>

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
