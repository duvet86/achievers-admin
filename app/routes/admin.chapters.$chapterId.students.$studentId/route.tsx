import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Clock,
  FloppyDiskArrowIn,
  WarningTriangle,
  Xmark,
} from "iconoir-react";

import { Title, SelectSearch } from "~/components";

import {
  assignStudentToMentorAsync,
  getStudentWithMentorsAsync,
  getMentorsInChapterAsync,
  removeMentorStudentAssignement,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const [studentWithMentors, availableMentors] = await Promise.all([
    getStudentWithMentorsAsync(Number(params.studentId)),
    getMentorsInChapterAsync(
      Number(params.chapterId),
      Number(params.studentId),
    ),
  ]);

  return {
    chapterId: params.chapterId,
    availableMentors,
    studentWithMentors,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();

  const mentorId = formData.get("mentorId")?.toString();
  if (mentorId === undefined) {
    return {
      mentorId: "",
      message: "You need to select a mentor first",
    };
  }

  if (request.method === "POST") {
    await assignStudentToMentorAsync(
      request,
      Number(mentorId),
      Number(params.studentId),
    );
  } else {
    await removeMentorStudentAssignement(
      Number(mentorId),
      Number(params.studentId),
    );
  }

  return {
    mentorId,
    message: null,
  };
}

export default function Index() {
  const {
    chapterId,
    availableMentors,
    studentWithMentors: { fullName, mentorToStudentAssignement },
  } = useLoaderData<typeof loader>();
  const { state, Form, data, submit } = useFetcher<{
    message: string | null;
    mentorId: string;
  }>();
  const [searchParams] = useSearchParams();

  const isLoading = state !== "idle";

  const onMentorRemoved =
    (studentFullName: string) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (confirm(`Are you sure you want to unassign "${studentFullName}"?`)) {
        submit(e.currentTarget, {
          method: "DELETE",
        });
      }
    };

  return (
    <>
      <Title
        to={
          searchParams.get("back_url")
            ? searchParams.get("back_url")!
            : `/admin/chapters/${chapterId}/students`
        }
      >
        Assign mentor to student
      </Title>

      <article className="prose w-full max-w-none">
        <div className="flex flex-col sm:flex-row sm:gap-12">
          <div className="sm:w-1/2">
            <h4>Student</h4>
            <div className="mt-4 text-xl">{fullName}</div>
          </div>

          <div>
            <h4>Assign a new mentor</h4>

            <Form
              method="POST"
              className="flex flex-col items-end gap-6 sm:flex-row"
            >
              <div className="w-full sm:w-96">
                <SelectSearch
                  key={data?.mentorId}
                  showClearButton
                  name="mentorId"
                  placeholder="start typing to select a mentor"
                  required
                  options={availableMentors.map(({ id, fullName }) => ({
                    label: fullName,
                    value: id.toString(),
                  }))}
                />
              </div>

              <button
                disabled={isLoading}
                className="btn btn-primary w-full sm:w-52"
                type="submit"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span> Loading...
                  </>
                ) : (
                  <>
                    <FloppyDiskArrowIn /> Add
                  </>
                )}
              </button>
            </Form>

            {data?.message && (
              <p className="flex items-center gap-2 text-error">
                <WarningTriangle />
                {data?.message}
              </p>
            )}
          </div>
        </div>

        <hr />

        <div>
          <h4>Assigned mentors</h4>
          <ol>
            {mentorToStudentAssignement.map(({ user: { fullName, id } }) => (
              <li key={id} className="border-b pb-2">
                <div className="flex flex-wrap items-center justify-between">
                  {fullName}
                  <div className="flex gap-2 sm:gap-6">
                    <Link
                      to="/admin/sessions"
                      className="btn btn-info hidden w-40 sm:flex"
                    >
                      <Clock />
                      View sessions
                    </Link>

                    <Form onSubmit={onMentorRemoved(fullName)}>
                      <input type="hidden" name="mentorId" value={id} />
                      <button
                        disabled={isLoading}
                        className="btn btn-error w-40"
                        type="submit"
                      >
                        {isLoading ? (
                          <>
                            <span className="loading loading-spinner"></span>{" "}
                            Loading...
                          </>
                        ) : (
                          <>
                            <Xmark />
                            Remove
                          </>
                        )}
                      </button>
                    </Form>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </>
  );
}
