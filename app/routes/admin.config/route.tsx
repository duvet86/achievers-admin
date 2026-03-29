import type { Route } from "./+types/route";

import { Check, NavArrowRight, Xmark } from "iconoir-react";

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
        <div>
          <span className="font-bold">App version:</span> {version}
        </div>

        <div className="mb-6 flex items-center gap-4">
          <span className="font-bold">Email reminders enabled:</span>
          {isEmailRemindersCheckEnabled ? (
            <Check className="text-success" />
          ) : (
            <Xmark className="text-error" />
          )}
          <StateLink to="email-reminders-police-check" className="btn w-48">
            View Police check <NavArrowRight />
          </StateLink>
          <StateLink to="email-reminders-wwc" className="btn w-48">
            View WWC <NavArrowRight />
          </StateLink>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <span className="font-bold">Mentor resources:</span>
          <StateLink to="mentor-resources" className="btn">
            Configure mentor resources <NavArrowRight />
          </StateLink>
        </div>
      </div>
    </>
  );
}
