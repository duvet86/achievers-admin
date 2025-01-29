import { type LoaderFunctionArgs } from "react-router";

import { useLoaderData } from "react-router";

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
        <table className="table-lg table">
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
                <td className="border-r border-gray-300">{index + 1}</td>
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
