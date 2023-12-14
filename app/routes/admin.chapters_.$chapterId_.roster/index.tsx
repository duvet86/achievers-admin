import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { BackHeader, Select, Title } from "~/components";
import type { SessionCommand } from "./services.server";

import {
  createSessionAsync,
  getCurrentTermForDate,
  getDatesForTerm,
  getStudentsAsync,
  terms,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(new Date());

  const students = await getStudentsAsync(Number(params.chapterId));

  return json({
    termsList: terms,
    currentTerm,
    students,
    datesInTerm: getDatesForTerm(currentTerm),
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const bodyData: SessionCommand = await request.json();

  await createSessionAsync(
    {
      attendedOn: bodyData.attendOn,
      chapterId: Number(params.chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    },
    {
      attendedOn: bodyData.attendOn,
      chapterId: Number(params.chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    },
  );

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const { students, currentTerm, termsList, datesInTerm } =
    useLoaderData<typeof loader>();

  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  return (
    <>
      <BackHeader to={`/admin/chapters`} />

      <Title>Roster planner</Title>

      <Form
        className="mb-6 flex gap-12"
        onChange={(e) => submit(e.currentTarget)}
      >
        <Select
          label="Term"
          name="selectedTerm"
          defaultValue={searchParams.get("selectedTerm") ?? currentTerm.name}
          options={termsList.map(({ name }) => ({
            label: name,
            value: name,
          }))}
        />
      </Form>

      <TermCalendar datesInTerm={datesInTerm} students={students} />
    </>
  );
}
