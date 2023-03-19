import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import {
  getAzureUsersAsync,
  getSessionUserAsync,
  readFormDataAsStringsAsync,
  Roles,
} from "~/services";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";

import Title from "~/components/Title";
import Select from "~/components/Select";
import DateInput from "~/components/DateInput";

import {
  getgMenteeByIdAsync,
  getMentorsMentoringMenteeAtChapterAsync,
  getMentorsAtChapterAsync,
  assignMentorToMenteeAsync,
} from "./services.server";
import BackHeader from "~/components/BackHeader";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.menteeId, "menteeId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [mentee, mentorsMentoringMentee, mentorsAtChapter] = await Promise.all([
    getgMenteeByIdAsync(params.menteeId),
    getMentorsMentoringMenteeAtChapterAsync(params.chapterId, params.menteeId),
    getMentorsAtChapterAsync(params.chapterId),
  ]);

  const mentorsMentoringMenteeLookup = mentorsMentoringMentee.reduce<
    Record<string, string>
  >((res, { userId }) => {
    res[userId] = userId;

    return res;
  }, {});

  const availableMentorIds = mentorsAtChapter
    .filter(({ userId }) => !mentorsMentoringMenteeLookup[userId])
    .map(({ userId }) => userId);

  const availableMentors = await getAzureUsersAsync(
    sessionUser.accessToken,
    availableMentorIds
  );

  return json({
    mentee,
    availableMentors: availableMentors.filter(({ appRoleAssignments }) =>
      appRoleAssignments
        .map(({ appRoleId }) => appRoleId)
        .includes(Roles.Mentor)
    ),
    assignedBy: sessionUser.userId,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.menteeId, "menteeId not found");

  const formData = await readFormDataAsStringsAsync(request);

  const mentorId = formData["mentorId"];
  const frequencyInDays = formData["frequencyInDays"];
  const startDate = formData["startDate"];
  const assignedBy = formData["assignedBy"];

  if (!mentorId || !frequencyInDays || !startDate || !assignedBy) {
    return json({
      error: "Select a Mentee, a Frequency and a Start Date please.",
    });
  }

  await assignMentorToMenteeAsync(
    mentorId,
    params.menteeId,
    params.chapterId,
    Number(frequencyInDays),
    dayjs(startDate, "YYYY-MM-DD").toDate(),
    assignedBy
  );

  return redirect(
    `/chapters/${params.chapterId}/mentees/${params.menteeId}/mentors`
  );
}

export default function Assign() {
  const { mentee, availableMentors, assignedBy } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useNavigation();

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <BackHeader />

      <Title>
        Assign Mentor to Mentee "{mentee.firstName} {mentee.lastName}"
      </Title>

      <Form method="post">
        <input type="hidden" name="assignedBy" value={assignedBy} />

        <Select
          label="Select a Mentor"
          name="mentorId"
          disabled={isSubmitting}
          options={[{ value: "", label: "Select a Mentor" }].concat(
            availableMentors.map(({ id, email }) => ({
              label: email,
              value: id,
            }))
          )}
        />

        <Select
          label="Select a Frequency"
          name="frequencyInDays"
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
