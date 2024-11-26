import type { LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, Link } from "@remix-run/react";
import { UserPlus, Calendar, Community } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { Title } from "~/components";

import { getChaptersAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const chapters = await getChaptersAsync(ability);

  return {
    chapters,
  };
}

export default function Index() {
  const { chapters } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Chapters</Title>

      {chapters.map(({ id, name, address }) => (
        <div key={id} className="card glass m-6 items-center">
          <div className="card-body items-center text-center">
            <h2 className="card-title uppercase">{name}</h2>
            <p className="mb-6">{address}</p>
            <div className="card-actions justify-center">
              <div className="join join-vertical w-full sm:join-horizontal sm:w-auto">
                <Link
                  to={`${id}/roster-students`}
                  className="btn btn-accent join-item"
                >
                  <Calendar />
                  Roster STUDENTS
                </Link>
                <Link
                  to={`${id}/roster-mentors`}
                  className="btn btn-accent join-item"
                >
                  <Calendar />
                  Roster MENTORS
                </Link>
              </div>

              <div className="join join-vertical w-full sm:join-horizontal sm:w-auto">
                <Link to={`${id}/students`} className="btn join-item">
                  <UserPlus />
                  Assign: STUDENT LIST
                </Link>
                <Link to={`${id}/mentors`} className="btn join-item">
                  <UserPlus />
                  Assign: MENTOR LIST
                </Link>
              </div>

              <div className="join join-vertical w-full sm:join-horizontal sm:w-auto">
                <Link
                  to={`/admin/chapters/${id}/attendances/mentors`}
                  className="btn btn-info join-item"
                >
                  <Community />
                  Attendances: MENTORS
                </Link>
                <Link
                  to={`/admin/chapters/${id}/attendances/students`}
                  className="btn btn-info join-item"
                >
                  <Community />
                  Attendances: STUDENTS
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
