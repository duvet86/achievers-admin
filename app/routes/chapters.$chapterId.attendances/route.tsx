import type { Route } from "./+types/route";

import { GraduationCap, User } from "iconoir-react";
import invariant from "tiny-invariant";

import { StateLink, Title } from "~/components";
import { getChapterAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterAsync(Number(params.chapterId));

  return { chapter };
}

export default function Index({
  loaderData: { chapter },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Attendances for &quot;{chapter.name}&quot;</Title>

      <div className="mt-6 flex flex-col flex-wrap gap-8 sm:flex-row">
        <StateLink to="mentors" className="btn btn-block h-24">
          <User />
          Mentors
        </StateLink>
        <StateLink to="students" className="btn btn-block h-24">
          <GraduationCap />
          Students
        </StateLink>
      </div>
    </>
  );
}
