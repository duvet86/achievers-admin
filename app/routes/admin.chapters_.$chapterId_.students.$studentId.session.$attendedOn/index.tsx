import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { BackHeader, Select, SubmitFormButton, Title } from "~/components";

import {
  asssignMentorAsync,
  getMentorsInChapterAsync,
  getStudentAsync,
} from "./services.server";
import dayjs from "dayjs";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const [student, mentors] = await Promise.all([
    getStudentAsync(Number(params.studentId)),
    getMentorsInChapterAsync(Number(params.chapterId)),
  ]);

  const assignemntLookup = student.mentorToStudentAssignement.reduce<
    Record<string, boolean>
  >((res, value) => {
    res[value.user.id] = true;
    return res;
  }, {});

  const uniqueMentors = mentors.filter((m) => !assignemntLookup[m.id]);

  return json({
    student,
    mentors: uniqueMentors,
    session: params.attendedOn,
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const formData = await request.formData();

  const selectedMentorId = formData.get("selectedMentorId")?.toString();

  if (selectedMentorId === undefined) {
    throw new Error();
  }

  const attendedOn = new Date(params.attendedOn);

  await asssignMentorAsync(
    request,
    {
      attendedOn: attendedOn,
      chapterId: Number(params.chapterId),
      studentId: Number(params.studentId),
      userId: Number(selectedMentorId),
    },
    {
      attendedOn: attendedOn,
      chapterId: Number(params.chapterId),
      studentId: Number(params.studentId),
      userId: Number(selectedMentorId),
    },
  );

  return redirect(`/admin/chapters/${params.chapterId}/roster`);
}

export default function Index() {
  const {
    student: { firstName, lastName, mentorToStudentAssignement },
    mentors,
    session,
  } = useLoaderData<typeof loader>();

  const options = [{ label: "Select a mentor", value: "" }].concat(
    mentors.map(({ id, firstName, lastName }) => ({
      label: `${firstName} ${lastName}`,
      value: id.toString(),
    })),
  );

  return (
    <>
      <BackHeader />

      <Title>Assign mentor for "{dayjs(session).format("MMMM D, YYYY")}"</Title>

      {mentorToStudentAssignement.length > 0 && (
        <article className="prose max-w-none">
          <div>
            Student "{firstName} {lastName}"" is currently assigned to:
          </div>
          <ul>
            {mentorToStudentAssignement.map(
              ({ user: { id, firstName, lastName } }) => (
                <li key={id}>
                  {firstName} {lastName}
                </li>
              ),
            )}
          </ul>
        </article>
      )}

      <hr className="my-4" />

      <Form method="post">
        <Select
          label="Assign temporary mentor"
          name="selectedMentorId"
          options={options}
        />

        <SubmitFormButton className="mt-6 justify-between" />
      </Form>
    </>
  );
}
