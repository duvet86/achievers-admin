import type { LoaderFunctionArgs } from "@remix-run/node";

import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getCurrentUserADIdAsync, getUserByAzureADIdAsync } from "~/services";

import {
  getNextSessionAsync,
  getStudentForSessionAsync,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId, true);

  const mentorFullName = user.firstName + " " + user.lastName;

  const nextSessionDate = await getNextSessionAsync(new Date().getFullYear());
  if (nextSessionDate === null) {
    return json({
      mentorFullName,
      nextSessionDate: null,
      student: null,
    });
  }

  const student = await getStudentForSessionAsync(
    user.id,
    user.userAtChapter[0].chapterId,
    new Date(nextSessionDate),
  );

  return json({
    mentorFullName,
    nextSessionDate: dayjs(nextSessionDate).format("MMMM D, YYYY"),
    student,
  });
}

export default function Index() {
  const { mentorFullName, nextSessionDate, student } =
    useLoaderData<typeof loader>();

  return (
    <div className="-m-4 h-full p-4">
      <article className="prose relative mb-8 h-24 max-w-none lg:h-28">
        <div className="h-24 w-full rounded-md bg-achievers opacity-75 lg:h-28"></div>
        <h1 className="absolute left-6 top-6 hidden lg:block">
          Welcome {mentorFullName}
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome {mentorFullName}
        </h2>
      </article>

      {student && nextSessionDate ? (
        <div>
          <div>
            Next session: <span className="font-medium">{nextSessionDate}</span>
          </div>
          <div>
            With{" "}
            <span className="font-medium">
              {student?.firstName} {student?.lastName}
            </span>
          </div>
        </div>
      ) : (
        <div>No sessions available</div>
      )}
    </div>
  );
}
