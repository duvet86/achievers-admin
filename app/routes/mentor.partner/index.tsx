import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { Link, useLoaderData } from "@remix-run/react";
import { Calendar } from "iconoir-react";

import { getCurrentUserADIdAsync, getUserByAzureADIdAsync } from "~/services";
import { Title } from "~/components";

import { getPartnersAync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId, true);

  const partners = await getPartnersAync(user.id);

  return json({
    partners,
  });
}

export default function Index() {
  const { partners } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>My partnes</Title>

      <div className="overflow-auto bg-white">
        <table className="table table-lg">
          <thead>
            <tr>
              <th className="w-6">#</th>
              <th align="left">Full name</th>
              <th align="left">Mobile</th>
              <th align="right">Action</th>
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
            {partners.map(
              ({ user: { id, firstName, lastName, mobile } }, index) => (
                <tr key={id}>
                  <td className="border-r">{index + 1}</td>
                  <td align="left">{`${firstName} ${lastName}`}</td>
                  <td align="left">-</td>
                  <td align="right">
                    <Link
                      to="/mentor/roster"
                      className="btn btn-success btn-xs h-8 gap-2"
                    >
                      <Calendar className="hidden h-4 w-4 lg:block" />
                      View roster
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
