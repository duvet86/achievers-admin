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
            <div className="card-actions justify-center">
              <Link to={`${id}/roster`} className="btn btn-accent w-64 gap-2">
                <Calendar className="h-4 w-4" />
                View roster
              </Link>
              <Link
                to={`${id}/sessions`}
                className="btn btn-success w-64 gap-2"
              >
                <PageEdit className="h-4 w-4" />
                Sessions/Reports
              </Link>
              <Link
                to={`${id}/students`}
                className="btn btn-primary w-64 gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Assign Menotor to Student
              </Link>
              <Link to={`${id}/mentors`} className="btn btn-warning w-64 gap-2">
                <Group className="h-4 w-4" />
                Assign Student to Mentor
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
