import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";

import { PageEdit, Group, Calendar, GraduationCap } from "iconoir-react";

import { Title } from "~/components";

import { getChaptersAsync } from "./services.server";

export async function loader() {
  const chapters = await getChaptersAsync();

  return json({ chapters });
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
            <div className="card-actions">
              <Link to={`${id}/roster`} className="btn btn-info w-32 gap-2">
                <Calendar className="h-4 w-4" />
                Roster
              </Link>
              <Link
                to={`${id}/students`}
                className="btn btn-primary w-32 gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Students
              </Link>
              <Link to={`${id}/mentors`} className="btn btn-warning w-32 gap-2">
                <Group className="h-4 w-4" />
                Mentors
              </Link>
              <Link to={`${id}/sessions`} className="btn w-32 gap-2">
                <PageEdit className="h-4 w-4" />
                Reports
              </Link>
              <Link to={id.toString()} className="btn btn-success w-32 gap-2">
                <PageEdit className="h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
