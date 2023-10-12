import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";

import { PageEdit, Group, Calendar } from "iconoir-react";

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
              <th align="left" className="w-1/3 p-2">
                Name
              </th>
              <th align="left" className="w-1/3 p-2">
                Address
              </th>
              <th align="right" className="w-1/3 p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {chapters.map(({ id, name, address }) => (
              <tr key={id}>
                <td className="border p-2">{name}</td>
                <td className="border p-2">{address}</td>
                <td className="border p-2">
                  <div className="join w-1/3">
                    <Link
                      to={`${id}/roster`}
                      className="btn btn-info join-item btn-xs w-full gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Roster
                    </Link>
                    <Link
                      to={`${id}/mentors`}
                      className="btn btn-warning join-item btn-xs w-full gap-2"
                    >
                      <Group className="h-4 w-4" />
                      Mentors
                    </Link>
                    <Link
                      to={id.toString()}
                      className="btn btn-success join-item btn-xs w-full gap-2"
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
