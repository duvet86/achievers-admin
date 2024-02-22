import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Xmark } from "iconoir-react";

import { BackHeader, Title } from "~/components";

import {
  getMentorAsync,
  removeMentorStudentAssignement,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");
  invariant(params.studentId, "studentId not found");

  const mentorWithStudent = await getMentorAsync({
    userId: Number(params.mentorId),
    studentId: Number(params.studentId),
  });

  if (mentorWithStudent === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    chapterId: params.chapterId,
    mentorId: params.mentorId,
    mentorWithStudent,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");
  invariant(params.studentId, "studentId not found");

  await removeMentorStudentAssignement({
    userId: Number(params.mentorId),
    studentId: Number(params.studentId),
  });

  return redirect(
    `/admin/chapters/${params.chapterId}/mentors/${params.mentorId}`,
  );
}

export default function Index() {
  const {
    chapterId,
    mentorId,
    mentorWithStudent: { user, student },
  } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <BackHeader to={`/admin/chapters/${chapterId}/mentors/${mentorId}`} />

      <Title>Remove student from mentor</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <article className="prose max-w-none">
            <h3>
              Are you sure you want to remove the student &quot;
              {student.firstName} {student.lastName}&quot; from mentor &quot;
              {user.firstName} {user.lastName}
              &quot;?
            </h3>
          </article>

          <div className="float-right">
            <button className="btn btn-error w-52 gap-5" type="submit">
              <Xmark className="h-6 w-6" />
              Remove
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
