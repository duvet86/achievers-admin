import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";

import { Check, Xmark, CheckCircle } from "iconoir-react";

import { version, isEmailRemaindersCheckEnabled } from "~/services/.server";
import { Title } from "~/components";

import { sendEmailRemaniders } from "./services.server";

export async function loader() {
  return json({
    version,
    isEmailRemaindersCheckEnabled,
  });
}

export async function action() {
  const totRemindersSent = await sendEmailRemaniders();

  return json({
    message: "Reminders sent: " + totRemindersSent,
  });
}

export default function Index() {
  const { version, isEmailRemaindersCheckEnabled } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Title>Configuration settings</Title>

      <div className="flex flex-col gap-4">
        <p>
          <span className="font-bold">App version:</span> {version}
        </p>

        <div className="mb-6 flex items-center gap-4">
          <span className="font-bold">Email remainders enabled:</span>
          {isEmailRemaindersCheckEnabled ? (
            <Check className="text-success" />
          ) : (
            <Xmark className="text-error" />
          )}
          <Link to="email-remainders-police-check" className="btn w-48">
            View Police check
          </Link>
          <Link to="email-remainders-wwc" className="btn w-48">
            View WWC
          </Link>
          <Form method="POST">
            <button className="btn btn-neutral w-48" type="submit">
              Send email
            </button>
          </Form>
        </div>
      </div>

      {actionData && (
        <div role="alert" className="alert alert-success">
          <CheckCircle className="h-6 w-6 shrink-0 stroke-current" />
          <span>{actionData.message}</span>
        </div>
      )}
    </>
  );
}
