import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { SessionCommand } from "./services.server";

import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useActionData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";

import { Select, Title } from "~/components";

import {
  createSessionAsync,
  deleteSessionAsync,
  getChaptersAsync,
  getCurrentTermForDate,
  getStateAsync,
  terms,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");
  const selectedChapter = url.searchParams.get("selectedChapter");

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(new Date());

  const chapters = await getChaptersAsync();

  const state = await getStateAsync(
    Number(selectedChapter) ?? chapters[0].id,
    currentTerm,
  );

  return json({
    termsList: terms,
    currentTerm,
    chapters,
    ...state,
  });
}

export async function action({ request }: ActionArgs) {
  const bodyData: SessionCommand = await request.json();
  const url = new URL(request.url);

  const chapters = await getChaptersAsync();

  const chapterId = url.searchParams.get("selectedChapter") ?? chapters[0].id;
  const selectedTerm = url.searchParams.get("selectedTerm");

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(new Date());

  if (request.method === "POST") {
    await createSessionAsync({
      attendedOn: bodyData.attendOn,
      chapterId: Number(chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    });
  } else if (request.method === "DELETE") {
    await deleteSessionAsync({
      attendedOn: bodyData.attendOn,
      chapterId: Number(chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    });
  } else {
    throw new Error();
  }

  const { studentsLookup } = await getStateAsync(
    Number(chapterId),
    currentTerm,
  );

  return json({
    studentsLookup,
  });
}

export default function Index() {
  const {
    chapters,
    currentTerm,
    termsList,
    datesInTerm,
    mentors,
    students,
    studentsLookup,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const studentsLookupInit = actionData?.studentsLookup ?? studentsLookup;

  return (
    <>
      <Title>Roster planner</Title>

      <Form
        className="mb-6 flex gap-12"
        onChange={(e) => submit(e.currentTarget)}
      >
        <div className="basis-1/3">
          <Select
            label="Term"
            name="selectedTerm"
            defaultValue={searchParams.get("selectedTerm") ?? currentTerm.name}
            options={termsList.map(({ name }) => ({
              label: name,
              value: name,
            }))}
          />
        </div>

        <div className="basis-1/3">
          <Select
            label="Chapter"
            name="selectedChapter"
            defaultValue={searchParams.get("selectedChapter") ?? ""}
            options={chapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            }))}
          />
        </div>
      </Form>

      <TermCalendar
        studentsLookupInit={studentsLookupInit}
        datesInTerm={datesInTerm}
        mentors={mentors}
        students={students}
      />
    </>
  );
}
