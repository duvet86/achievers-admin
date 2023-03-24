import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import ServerIcon from "@heroicons/react/24/solid/ServerIcon";

import BackHeader from "~/components/BackHeader";
import DateInput from "~/components/DateInput";
import Input from "~/components/Input";
import Textarea from "~/components/Textarea";
import Title from "~/components/Title";

import { getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        Welcome call acknowledgement for "{user.firstName} {user.lastName}"
      </Title>

      <Form>
        <Input
          label="Called by"
          name="calledBy"
          defaultValue={user.welcomeCall?.calledBy ?? ""}
        />

        <DateInput
          defaultValue={
            user.welcomeCall && user.welcomeCall.calledOnDate
              ? new Date(user.welcomeCall.calledOnDate)
              : ""
          }
          label="Called on date"
          name="calledOnDate"
        />

        <Textarea
          label="Comment"
          name="comment"
          defaultValue={user.welcomeCall?.comment ?? ""}
        />

        <button
          className="btn-primary btn float-right mt-6 w-52 gap-4"
          type="submit"
        >
          <ServerIcon className="h-6 w-6" />
          Save
        </button>
      </Form>
    </>
  );
}
