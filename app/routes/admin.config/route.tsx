import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Check, Xmark } from "iconoir-react";
import { Title } from "~/components";

import { version, isEmailRemaindersCheckEnabled } from "~/services/.server";

export async function loader() {
  return json({
    version,
    isEmailRemaindersCheckEnabled,
  });
}

export default function Index() {
  const { version, isEmailRemaindersCheckEnabled } =
    useLoaderData<typeof loader>();

  return (
    <>
      <Title>Configuration settings</Title>

      <div className="flex flex-col gap-4">
        <p>
          <span className="font-bold">App version:</span> {version}
        </p>
        <p className="flex items-center gap-4">
          <span className="font-bold">Email remainders enabled:</span>
          {isEmailRemaindersCheckEnabled ? (
            <Check className="text-success" />
          ) : (
            <Xmark className="text-error" />
          )}
          <Link to="email-remainders" className="btn w-28">
            View
          </Link>
        </p>
      </div>
    </>
  );
}
