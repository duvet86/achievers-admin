import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { ShareAndroid, Xmark } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { Title } from "~/components";

import {
  getPartnersAync,
  removeShareInfo,
  shareInfoWithPartner,
} from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const partners = await getPartnersAync(loggedUser.oid);

  return {
    partners,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  const formData = await request.formData();

  const action = formData.get("action")!.toString();
  const partnerId = formData.get("partnerId")!.toString();

  if (action === "share") {
    await shareInfoWithPartner(loggedUser.oid, Number(partnerId));
  } else {
    await removeShareInfo(loggedUser.oid, Number(partnerId));
  }

  return null;
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, submit } = useFetcher<typeof loader>();

  const { partners } = data ?? loaderData;

  const onSubmit =
    (
      actionToPerform: "share" | "remove",
      partnerId: number,
      partnerName: string,
    ) =>
    () => {
      if (actionToPerform === "share") {
        if (
          !confirm(
            `You are about to share your email and phone number with "${partnerName}". Are you sure?`,
          )
        ) {
          return;
        }
      }

      const formData = new FormData();
      formData.set("action", actionToPerform);
      formData.set("partnerId", partnerId.toString());

      void submit(formData, { method: "POST" });
    };

  return (
    <>
      <Title>My partners</Title>

      <div className="overflow-auto bg-white">
        <table className="table-lg table">
          <thead>
            <tr>
              <th className="w-6">#</th>
              <th align="left">Full name</th>
              <th align="left">Email</th>
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
              ({ id, fullName, isInfoShared, email, mobile }, index) => (
                <tr key={id}>
                  <td className="border-r border-gray-300">{index + 1}</td>
                  <td align="left">{fullName}</td>
                  <td align="left">{email ?? "-"}</td>
                  <td align="left">{mobile ?? "-"}</td>
                  <td align="right">
                    {isInfoShared ? (
                      <button
                        className="btn btn-error btn-xs gap-2"
                        onClick={onSubmit("remove", id, fullName)}
                      >
                        <Xmark className="hidden h-4 w-4 sm:block" /> Remove
                        Mobile and email
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-xs gap-2"
                        onClick={onSubmit("share", id, fullName)}
                      >
                        <ShareAndroid className="hidden h-4 w-4 sm:block" />{" "}
                        Share Mobile and email
                      </button>
                    )}
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
