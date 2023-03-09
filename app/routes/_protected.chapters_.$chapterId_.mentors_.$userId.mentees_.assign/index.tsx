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

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  Roles,
  getMenteesMentoredByAsync,
} from "~/services";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import {
  getMenteesInChapterAsync,
  assignMenteeFromMentorAsync,
} from "./services.server";
import Title from "~/components/Title";
import Select from "~/components/Select";
import DateInput from "~/components/DateInput";

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
    assignedBy: sessionUser.userId,
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
    <>
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      <Title>Assign Mentee to Mentor "{mentor.email}"</Title>

      <Form method="post">
        <input type="hidden" name="assignedBy" value={mentor.email} />

        <Select
          label="Select a Mentee"
          name="menteeId"
          disabled={isSubmitting}
          options={[{ value: "", label: "Select a Mentee" }].concat(
            availableMentees.map(({ id, firstName, lastName }) => ({
              label: `${firstName} ${lastName}`,
              value: id,
            }))
          )}
        />

        <Select
          label="Select a Frequency"
          name="frequency"
          disabled={isSubmitting}
          options={[
            { value: "", label: "Select a Frequency" },
            { value: "7", label: "Every Week" },
            { value: "14", label: "Quarterly" },
          ]}
        />

        <DateInput
          defaultValue={dayjs().format("YYYY-MM-DD")}
          label="Start Date"
          name="startDate"
          min={dayjs().format("YYYY-MM-DD")}
        />

        <p className="mt-4 text-red-600">{actionData?.error}</p>

        <button
          className="btn-primary btn float-right mt-6 w-28 gap-2"
          type="submit"
        >
          <PlusIcon className="h-6 w-6" />
          Save
        </button>
      </Form>
    </>
  );
}
