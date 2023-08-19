import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";

import { PageEdit } from "iconoir-react";

import { Title } from "~/components";

import { getChaptersAsync } from "./services.server";

export async function loader() {
  const chapters = await getChaptersAsync();

  return json({ chapters });
}

export default function Chapters() {
  const { chapters } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Chapters</Title>

      <div className="overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Name
              </th>
              <th align="left" className="p-2">
                Address
              </th>
              <th align="right" className="p-2">
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
                  <Link
                    to={id.toString()}
                    className="btn-success btn-xs btn w-full gap-2"
                  >
                    <PageEdit className="h-4 w-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
