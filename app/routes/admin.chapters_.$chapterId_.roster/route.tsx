import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { SessionCommand } from "./services.server";

import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getDatesForTerm } from "~/services";
import { Select, Title } from "~/components";

import {
  upsertSessionAsync,
  getCurrentTermForDate,
  getSchoolTermsForYearAsync,
  getStudentsAsync,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const students = await getStudentsAsync(Number(params.chapterId));

  return json({
    chapterId: params.chapterId,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})`,
    })),
    currentTerm,
    students,
    datesInTerm: getDatesForTerm(currentTerm.start, currentTerm.end),
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const bodyData: SessionCommand = await request.json();

  await upsertSessionAsync({
    sessionId: bodyData.sessionId ? Number(bodyData.sessionId) : undefined,
    attendedOn: bodyData.attendedOn,
    chapterId: Number(params.chapterId),
    studentId: Number(bodyData.studentId),
    userId: Number(bodyData.userId),
  });

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const { students, currentTerm, termsList, datesInTerm, chapterId } =
    useLoaderData<typeof loader>();

  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Title>Roster planner</Title>

      <Form
        className="mb-6 flex gap-12"
        onChange={(e) => submit(e.currentTarget)}
      >
        <Select
          label="Term"
          name="selectedTerm"
          defaultValue={searchParams.get("selectedTerm") ?? currentTerm.name}
          options={termsList}
        />
      </Form>

      <div className="relative">
        <TermCalendar
          chapterId={chapterId}
          datesInTerm={datesInTerm}
          students={students}
        />
      </div>
    </>
  );
}
