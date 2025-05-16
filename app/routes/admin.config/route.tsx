import type { Route } from "./+types/route";

import { Check, Xmark } from "iconoir-react";

import { version, isEmailRemindersCheckEnabled } from "~/services/.server";
import { StateLink, Title } from "~/components";

export function loader() {
  return {
    version,
    isEmailRemindersCheckEnabled: isEmailRemindersCheckEnabled,
  };
}

export default function Index({
  loaderData: { version, isEmailRemindersCheckEnabled },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Configuration settings</Title>

      <div className="mt-4 flex flex-col gap-4">
        <p>
          <span className="font-bold">App version:</span> {version}
        </p>

        <div className="mb-6 flex items-center gap-4">
          <span className="font-bold">Email reminders enabled:</span>
          {isEmailRemindersCheckEnabled ? (
            <Check className="text-success" />
          ) : (
            <Xmark className="text-error" />
          )}
          <StateLink to="email-reminders-police-check" className="btn w-48">
            View Police check
          </StateLink>
          <StateLink to="email-reminders-wwc" className="btn w-48">
            View WWC
          </StateLink>
        </div>
      </div>
    </>
  );
}
