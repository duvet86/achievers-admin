import type { LinksFunction, LoaderFunctionArgs } from "react-router";

import { useLoaderData, useSearchParams } from "react-router";
import invariant from "tiny-invariant";
import { Check } from "iconoir-react";
import dayjs from "dayjs";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, Textarea, Title } from "~/components";

import { getGoalById } from "./services.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.goalId, "goalId not found");

  const goal = await getGoalById(Number(params.goalId));

  return {
    goal,
  };
}

export default function Index() {
  const { goal } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Title to={`/admin/goals?${searchParams.toString()}`}>
          Goal for &quot;{goal.student.fullName}&quot;
        </Title>

        {goal.isAchieved && (
          <div className="alert alert-success w-48">
            <Check /> Goal completed
          </div>
        )}
      </div>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Title</div>
          <div className="flex-1">{goal.title}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">End date</div>
          <div className="flex-1">
            {dayjs(goal.endDate).format("D MMMM YYYY")}
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Goal</div>
          <div className="flex-1">
            <Editor isReadonly initialEditorStateType={goal.goal} />
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Result</div>
          <div className="flex-1">
            <Textarea
              label="Result"
              placeholder=""
              name="result"
              defaultValue={goal.result ?? ""}
              readOnly
            />
          </div>
        </div>
      </div>
    </>
  );
}
