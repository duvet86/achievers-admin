import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";

import BackHeader from "~/components/BackHeader";
import Title from "~/components/Title";

import { getEOIUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.eoiId, "eoiId not found");

  const eoiUser = await getEOIUserByIdAsync(Number(params.eoiId));

  return json({
    eoiUser,
  });
}

export default function Index() {
  const { eoiUser } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        Invite "{eoiUser.firstName} {eoiUser.lastName}"
      </Title>

      <Form method="post">
        <p className="mb-6">
          Are you sure you want to invite "{eoiUser.firstName}{" "}
          {eoiUser.lastName}" to become a user of the Achiever app?
        </p>

        <button className="btn-primary btn w-40 gap-3">
          <UserPlusIcon className="h-6 w-6" />
          Invite
        </button>
      </Form>
    </>
  );
}
