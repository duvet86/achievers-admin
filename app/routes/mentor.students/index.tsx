import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { getCurrentUserADIdAsync, getUserByAzureADIdAsync } from "~/services";
import { Title } from "~/components";

import { getMentorStudentsAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

  const students = await getMentorStudentsAsync(user.id);

  return json({
    students,
  });
}

export default function Index() {
  const { students } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>My students</Title>

      <div>
        {students.map(({ student: { id, firstName, lastName } }) => (
          <div key={id}>
            <div>{firstName}</div>
            <div>{lastName}</div>
            <button>View reports</button>
          </div>
        ))}
      </div>
    </>
  );
}
