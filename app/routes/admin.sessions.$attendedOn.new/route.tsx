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

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.attendedOn, "attendedOn not found");

  const url = new URL(request.url);
  const chapterId = url.searchParams.get("chapterId");
  const studentId = url.searchParams.get("studentId");

  invariant(chapterId, "chapterId not found");
  invariant(studentId, "studentId not found");

  const chapter = await getChapterByIdAsync(Number(chapterId));

  const student = await getStudentByIdAsync(Number(studentId));

  const mentors = studentId
    ? await getMentorForStudentAsync(Number(studentId))
    : [];

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
  invariant(params.attendedOn, "attendedOn not found");

  const url = new URL(request.url);
  const chapterId = url.searchParams.get("chapterId");
  const studentId = url.searchParams.get("studentId");

  const formData = await request.formData();
  const userId = formData.get("userId");

  invariant(chapterId, "chapterId not found");
  invariant(studentId, "studentId not found");
  invariant(userId, "userId not found");

  const session = await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(chapterId),
    studentId: Number(studentId),
    userId: Number(userId),
  });

  const backURL = url.searchParams.get("backURL");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect(
    `/admin/sessions/${session.id}?${url.searchParams.toString()}`,
  );
}

export default function Index() {
  const { attendedOn, chapter, mentors, student } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("backURL");

  return (
    <>
      <Title
        className="mb-4"
        to={backURL ? backURL : `/admin/sessions?${searchParams.toString()}`}
      >
        Update session of &quot;{attendedOn}&quot;
      </Title>

      <Text label="Chapter" text={chapter.name} />
      <Text label="Student" text={student.fullName} />

      <SubTitle>Update mentor</SubTitle>

      <Form method="post">
        <Select label="Mentor" name="userId" options={mentors} required />

        <div className="mt-4 flex justify-end">
          <SubmitFormButton />
        </div>
      </Form>
    </>
  );
}
