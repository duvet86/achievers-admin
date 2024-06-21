import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { Title, Select, SubmitFormButton, Text, SubTitle } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getMentorForStudentAsync,
  getStudentByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const chapter = await getChapterByIdAsync(Number(params.chapterId));
  const student = await getStudentByIdAsync(Number(params.studentId));

  const mentors = await getMentorForStudentAsync(Number(params.studentId));

  return json({
    chapter,
    student,
    attendedOn: dayjs(params.attendedOn, "YYYY-MM-DD").format("DD/MM/YYYY"),
    mentors: [{ label: "Select a mentor", value: "" }].concat(
      mentors.map(({ user: { id, fullName } }) => ({
        label: fullName,
        value: id.toString(),
      })),
    ),
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const formData = await request.formData();
  const userId = formData.get("userId");

  invariant(userId, "userId not found");

  const session = await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    studentId: Number(params.studentId),
    userId: Number(userId),
  });

  const url = new URL(request.url);
  const backURL = url.searchParams.get("backURL");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect(`/admin/sessions/${session.id}?${url.searchParams}`);
}

export default function Index() {
  const { attendedOn, chapter, mentors, student } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("backURL");

  return (
    <>
      <Title
        to={backURL ? backURL : `/admin/sessions?${searchParams}`}
        className="mb-4"
      >
        Update session of &quot;{attendedOn}&quot;
      </Title>

      <Text label="Chapter" text={chapter.name} />
      <Text label="Student" text={student.fullName} />

      <SubTitle>Update mentor</SubTitle>

      <Form method="post">
        <Select label="Mentor" name="userId" options={mentors} required />

        <SubmitFormButton className="mt-6 justify-between" />
      </Form>
    </>
  );
}
