import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { BackHeader, Title } from "~/components";

import { getTeacherByIdAsync, deleteTeacherByIdAsync } from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.teacherId, "teacherId not found");

  const teacher = await getTeacherByIdAsync(Number(params.teacherId));
  if (teacher === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    studentId: params.studentId,
    teacher,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.teacherId, "teacherId not found");

  await deleteTeacherByIdAsync(Number(params.teacherId));

  return redirect(`/admin/students/${params.studentId}`);
}

export default function Index() {
  const { studentId, teacher } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <BackHeader to={`/admin/students/${studentId}`} />

      <Title>Remove teacher &quot;{teacher.fullName}&quot;</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <article className="prose max-w-none">
            <h3>
              Are you sure you want to remove &quot;{teacher.fullName}&quot;
              from student &quot;{teacher.student.firstName}{" "}
              {teacher.student.lastName}
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
