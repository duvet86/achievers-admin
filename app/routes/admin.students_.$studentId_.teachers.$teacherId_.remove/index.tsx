import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { BackHeader, Title } from "~/components";

import { getTeacherByIdAsync, deleteTeacherByIdAsync } from "./services.server";
import { Cancel } from "iconoir-react";

export async function loader({ params }: LoaderArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.teacherId, "teacherId not found");

  const teacher = await getTeacherByIdAsync(Number(params.teacherId));
  if (teacher === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    teacher,
  });
}

export async function action({ params }: ActionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.teacherId, "teacherId not found");

  await deleteTeacherByIdAsync(Number(params.teacherId));

  return redirect(`/admin/students/${params.studentId}`);
}

export default function Index() {
  const { teacher } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <BackHeader to="../../../" />

      <Title>Remove teacher "{teacher.fullName}"</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <article className="prose max-w-none">
            <h3>
              Are you sure you want to remove "{teacher.fullName}"" from student
              "{teacher.student.firstName} {teacher.student.lastName}
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
