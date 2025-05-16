import type { Route } from "./+types/route";

import { UserPlus, Calendar, Community } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { StateLink, Title } from "~/components";

import { getChaptersAsync } from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const chapters = await getChaptersAsync(ability);

  return {
    chapters,
  };
}

export default function Index({
  loaderData: { chapters },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Chapters</Title>

      {chapters.map(({ id, name, address }) => (
        <div key={id} className="card glass m-6 items-center">
          <div className="card-body items-center text-center">
            <h2 className="card-title uppercase">{name}</h2>
            <p className="mb-6">{address}</p>
            <div className="card-actions justify-center">
              <div className="join join-vertical sm:join-horizontal w-full sm:w-auto">
                <StateLink
                  to={`${id}/roster-students`}
                  className="btn btn-primary join-item"
                >
                  <Calendar />
                  Roster STUDENTS
                </StateLink>
                <StateLink
                  to={`${id}/roster-mentors`}
                  className="btn btn-primary join-item"
                >
                  <Calendar />
                  Roster MENTORS
                </StateLink>
              </div>

              <div className="join join-vertical sm:join-horizontal w-full sm:w-auto">
                <StateLink to={`${id}/students`} className="btn join-item">
                  <UserPlus />
                  Assign: STUDENT LIST
                </StateLink>
                <StateLink to={`${id}/mentors`} className="btn join-item">
                  <UserPlus />
                  Assign: MENTOR LIST
                </StateLink>
              </div>

              <div className="join join-vertical sm:join-horizontal w-full sm:w-auto">
                <StateLink
                  to={`/admin/chapters/${id}/attendances/mentors`}
                  className="btn btn-secondary join-item"
                >
                  <Community />
                  Attendances: MENTORS
                </StateLink>
                <StateLink
                  to={`/admin/chapters/${id}/attendances/students`}
                  className="btn btn-secondary join-item"
                >
                  <Community />
                  Attendances: STUDENTS
                </StateLink>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
