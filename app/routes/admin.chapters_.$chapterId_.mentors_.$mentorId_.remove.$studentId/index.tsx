import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Cancel } from "iconoir-react";

import { BackHeader, Title } from "~/components";

import {
  getMentorAsync,
  removeMentorStudentAssignement,
} from "./services.server";

export async function loader({ params }: LoaderArgs) {
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
    mentorWithStudent,
  });
}

export async function action({ params }: ActionArgs) {
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
    mentorWithStudent: { user, student },
  } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <BackHeader to="../../" />

      <Title>Remove student from mentor</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <article className="prose max-w-none">
            <h3>
              Are you sure you want to remove the student "{student.firstName}{" "}
              {student.lastName}" from mentor "{user.firstName} {user.lastName}
              "?
            </h3>
          </article>

          <div className="float-right">
            <button className="btn btn-error w-52 gap-5" type="submit">
              <Cancel className="h-6 w-6" />
              Remove
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
