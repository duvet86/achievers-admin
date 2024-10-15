import { type LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { Title } from "~/components";

import { getPartnersAync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const partners = await getPartnersAync(loggedUser.oid);

  return {
    partners,
  };
}

export default function Index() {
  const { partners } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>My partners</Title>

      <div className="overflow-auto bg-white">
        <table className="table table-lg">
          <thead>
            <tr>
              <th className="w-6">#</th>
              <th align="left">Full name</th>
              <th align="left">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <i>No partners</i>
                </td>
              </tr>
            )}
            {partners.map(({ user: { id, fullName } }, index) => (
              <tr key={id}>
                <td className="border-r">{index + 1}</td>
                <td align="left">{fullName}</td>
                <td align="left">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
