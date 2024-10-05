/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import {
  Form,
  json,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import dayjs from "dayjs";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { getDatesForTerm } from "~/services";
import { Select, Title } from "~/components";

import {
  getCurrentTermForDate,
  getSessionsLookupAsync,
  getSchoolTermsForYearAsync,
  getUserByAzureADIdAsync,
  getStudentsForSessionAsync,
  createSessionAsync,
  takeSessionFromParterAsync,
  removeSessionAsync,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const todayterm = getCurrentTermForDate(terms, new Date());

  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;

  const { mySessionsLookup, myStudentsSessionsLookup } =
    await getSessionsLookupAsync(user.chapterId, user.id, currentTerm);

  return json({
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    currentTermName: currentTerm.name,
    mySessionsLookup,
    myStudentsSessionsLookup,
    datesInTerm: getDatesForTerm(currentTerm.start, currentTerm.end).map(
      (date) => dayjs(date).format("YYYY-MM-DD"),
    ),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const bodyData = (await request.json()) as {
    action: "fetch" | "create" | "update" | "remove";
    attendedOn?: string;
    studentId?: string;
    sessionId?: string;
  };

  const action = bodyData.action;
  const attendedOn = bodyData.attendedOn;
  const studentId = bodyData.studentId;
  const sessionId = bodyData.sessionId;

  switch (action) {
    case "fetch": {
      const studentsForSession = await getStudentsForSessionAsync(
        user.chapterId,
        user.id,
        attendedOn!,
      );

      return json({
        studentsForSession,
      });
    }

    case "create": {
      await createSessionAsync({
        attendedOn: attendedOn!,
        chapterId: user.chapterId,
        studentId: studentId ? Number(studentId) : null,
        userId: user.id,
      });

      return null;
    }
    case "update": {
      await takeSessionFromParterAsync(Number(sessionId), user.id);

      return null;
    }

    case "remove": {
      await removeSessionAsync(Number(sessionId));

      const studentsForSession = await getStudentsForSessionAsync(
        user.chapterId,
        user.id,
        attendedOn!,
      );

      return json({
        studentsForSession,
      });
    }

    default:
      throw new Error("Invalid action type");
  }
}

export default function Index() {
  const {
    mySessionsLookup,
    myStudentsSessionsLookup,
    currentTermName,
    termsList,
    datesInTerm,
  } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Title>Roster planner</Title>

      <Form
        className="mb-6 flex flex-col gap-2"
        onChange={(e) => submit(e.currentTarget)}
      >
        <Select
          label="Term"
          name="selectedTerm"
          defaultValue={searchParams.get("selectedTerm") ?? currentTermName}
          options={termsList}
        />
      </Form>

      <TermCalendar
        key={currentTermName}
        datesInTerm={datesInTerm}
        mySessionsLookup={mySessionsLookup as any}
        myStudentsSessionsLookup={myStudentsSessionsLookup as any}
      />
    </>
  );
}
