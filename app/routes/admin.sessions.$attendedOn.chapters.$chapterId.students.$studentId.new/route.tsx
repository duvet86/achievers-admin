import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { Title, SubmitFormButton, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getMentorForStudentAsync,
  getStudentByIdAsync,
} from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const [chapter, student, mentors] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getStudentByIdAsync(Number(params.studentId)),
    getMentorForStudentAsync(
      Number(params.chapterId),
      Number(params.studentId),
    ),
  ]);

  return {
    chapter,
    student,
    attendedOnLabel: dayjs(params.attendedOn, "YYYY-MM-DD").format(
      "MMMM D, YYYY",
    ),
    mentors: mentors.map(({ id, fullName }) => ({
      label: fullName,
      value: id.toString(),
    })),
  };
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();
  const mentorId = formData.get("mentorId");

  invariant(mentorId, "mentorId not found");

  const session = await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    studentId: Number(params.studentId),
    userId: Number(mentorId),
  });

  const url = new URL(request.url);
  const backURL = url.searchParams.get("back_url");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect(
    `/admin/sessions/${session.id}?${url.searchParams.toString()}`,
  );
}

export default function Index() {
  const { attendedOnLabel, chapter, mentors, student } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <Title
        to={backURL ? backURL : `/admin/sessions?${searchParams.toString()}`}
      >
        Session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{student.fullName}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Mentor</div>
          <Form className="flex flex-1 items-end gap-4" method="post">
            <SelectSearch
              name="mentorId"
              placeholder="Select a mentor"
              options={mentors}
              required
            />

            <SubmitFormButton />
          </Form>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Has report?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Is report completed?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Is report signed off?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
        </div>
      </div>
    </>
  );
}
