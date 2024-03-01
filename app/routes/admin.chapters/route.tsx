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

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left" className="hidden lg:table-cell">
                Address
              </th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map(({ id, name, address }) => (
              <tr key={id}>
                <td className="border">{name}</td>
                <td className="hidden border lg:table-cell">{address}</td>
                <td className="border">
                  <div className="join h-12 w-full">
                    <Link
                      to={`${id}/roster`}
                      className="btn btn-info join-item btn-xs h-full w-1/5 gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Roster
                    </Link>
                    <Link
                      to={`${id}/students`}
                      className="btn btn-primary join-item btn-xs h-full w-1/5 gap-2"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Students
                    </Link>
                    <Link
                      to={`${id}/mentors`}
                      className="btn btn-warning join-item btn-xs h-full w-1/5 gap-2"
                    >
                      <Group className="h-4 w-4" />
                      Mentors
                    </Link>
                    <Link
                      to={`${id}/reports`}
                      className="btn join-item btn-xs h-full w-1/5 gap-2"
                    >
                      <PageEdit className="h-4 w-4" />
                      Reports
                    </Link>
                    <Link
                      to={id.toString()}
                      className="btn btn-success join-item btn-xs h-full w-1/5 gap-2"
                    >
                      <PageEdit className="h-4 w-4" />
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
