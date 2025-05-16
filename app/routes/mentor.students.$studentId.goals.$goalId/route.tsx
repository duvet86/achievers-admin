import type { EditorState } from "lexical";
import type { Route } from "./+types/route";

import { useRef } from "react";
import { Form, redirect, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { Check, FloppyDiskArrowIn } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { DateInput, Editor, Input, Textarea, Title } from "~/components";

import {
  createGoalAsync,
  getGoalById,
  getStudentByIdAsync,
  getUserByAzureADIdAsync,
  updateGoalByIdAsync,
} from "./services.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.goalId, "goalId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  const minEndDate = dayjs().format("YYYY-MM-DD");

  if (params.goalId === "new") {
    return {
      student,
      goal: {
        result: null,
        id: 0,
        endDate: null,
        goal: null,
        title: "",
        isAchieved: false,
      },
      minEndDate,
    };
  }

  const goal = await getGoalById(Number(params.goalId));

  return {
    student,
    goal,
    minEndDate,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.goalId, "goalId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const formData = await request.formData();

  const title = formData.get("title")?.toString();
  const endDate = formData.get("endDate")?.toString();
  const goal = formData.get("goal")?.toString();
  const result = formData.get("goal")?.toString();
  const isComplete = formData.get("complete")?.toString();

  invariant(title);
  invariant(endDate);
  invariant(goal);

  let id: number;

  if (params.goalId === "new") {
    id = await createGoalAsync({
      chapterId: user.chapterId,
      mentorId: user.id,
      studentId: Number(params.studentId),
      endDate,
      goal,
      result: result ?? null,
      title,
      isComplete: false,
    });
  } else {
    id = await updateGoalByIdAsync(Number(params.goalId), {
      chapterId: user.chapterId,
      mentorId: user.id,
      studentId: Number(params.studentId),
      endDate,
      goal,
      result: result ?? null,
      title,
      isComplete: isComplete === "true",
    });
  }

  return redirect(`/mentor/students/${params.studentId}/goals/${id}`);
}

export default function Index({
  loaderData: { student, goal, minEndDate },
}: Route.ComponentProps) {
  const submit = useSubmit();

  const editorStateRef = useRef<EditorState>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const goal = JSON.stringify(editorStateRef.current?.toJSON());

    if (!goal) {
      return alert("You must set a goal.");
    }

    const formData = new FormData(e.currentTarget);
    formData.append("goal", goal);

    // Hack to get the value of the button since, if the form is submitted programatically,
    // the value won't get fetched.
    if ((document.activeElement as HTMLButtonElement).value === "complete") {
      formData.append("complete", "true");
    }

    void submit(formData, { method: "post" });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Title>Goal for &quot;{student.fullName}&quot;</Title>

        {goal.isAchieved && (
          <div className="alert alert-success w-48">
            <Check /> Goal completed
          </div>
        )}
      </div>

      <hr className="my-4" />

      <Form method="post" onSubmit={onSubmit}>
        <fieldset className="fieldset">
          <Input
            label="Goal title"
            name="title"
            defaultValue={goal.title}
            required
            readOnly={goal.isAchieved}
            disabled={goal.isAchieved}
          />

          <DateInput
            defaultValue={goal.endDate ?? ""}
            label="To be completed on"
            name="endDate"
            min={minEndDate}
            required
            readOnly={goal.isAchieved}
            disabled={goal.isAchieved}
          />

          <label className="fieldset-label">Goal</label>
          <div className="flex min-h-64">
            <Editor
              isReadonly={goal.isAchieved}
              initialEditorStateType={goal.goal}
              onChange={(editorState) => (editorStateRef.current = editorState)}
            />

            <div className="border bg-slate-100 p-2 text-pretty sm:block">
              <div className="mb-2">
                <h2 className="card-title">S.M.A.R.T. GOAL</h2>
                <p>Try creating a smart goal answering these questions:</p>
              </div>

              <div className="m-2">
                <div className="mb-2">
                  <h2 className="card-title">
                    <Check /> SPECIFIC
                  </h2>
                  <p className="italic">
                    What am I going to do? Why is this important to me?
                  </p>
                </div>

                <div className="mb-2">
                  <h2 className="card-title">
                    <Check /> MEASURABLE
                  </h2>
                  <p className="italic">
                    How will I measure my success? How will I know when I have
                    achieved my goal?
                  </p>
                </div>

                <div className="mb-2">
                  <h2 className="card-title">
                    <Check /> ACHIEVABLE
                  </h2>
                  <p className="italic">
                    What will I do to achieve this goal? How will I accomplish
                    this goal?
                  </p>
                </div>

                <div className="mb-2">
                  <h2 className="card-title">
                    <Check /> RELEVANT
                  </h2>
                  <p className="italic">
                    Is this goal worthwhile? How will achieving it help me? Does
                    this goal fit my values?
                  </p>
                </div>

                <div className="mb-2">
                  <h2 className="card-title">
                    <Check /> TIME-BOUND
                  </h2>
                  <p className="italic">
                    When will I accomplish my goal? How long will I give myself?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Textarea
            label="Result"
            name="result"
            defaultValue={goal.result ?? ""}
            readOnly={goal.isAchieved}
            disabled={goal.isAchieved}
          />

          {!goal.isAchieved && (
            <div className="mt-4 flex justify-end gap-4">
              {goal.goal && (
                <button
                  className="btn btn-success w-48"
                  type="submit"
                  name="save"
                  value="complete"
                >
                  <Check />
                  Mark completed
                </button>
              )}

              <button
                className="btn btn-primary w-48"
                type="submit"
                name="save"
                value="test"
              >
                <FloppyDiskArrowIn />
                Save
              </button>
            </div>
          )}
        </fieldset>
      </Form>
    </>
  );
}
