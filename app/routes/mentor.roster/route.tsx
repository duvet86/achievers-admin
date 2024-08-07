import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { SessionCommandRequest } from "./services.server";

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
  createSessionAsync,
  getCurrentTermForDate,
  getStudentsAsync,
  getSchoolTermsForYearAsync,
  removeSessionAsync,
  getUserByAzureADIdAsync,
  stealSessionFromParterAsync,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");
  const selectedStudentId = url.searchParams.get("selectedStudentId");

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const {
    students,
    selectedStudent,
    sessionDateToMentorIdForAllStudentsLookup,
  } = await getStudentsAsync(user.id, Number(selectedStudentId));

  return json({
    userId: user.id,
    chapterId: user.chapterId,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})`,
    })),
    currentTerm,
    students,
    sessionDateToMentorIdForAllStudentsLookup,
    selectedStudent,
    datesInTerm: getDatesForTerm(currentTerm.start, currentTerm.end),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const bodyData = (await request.json()) as SessionCommandRequest;

  const action = bodyData.action;

  switch (action) {
    case "create":
      await createSessionAsync({
        attendedOn: bodyData.attendedOn,
        chapterId: Number(bodyData.chapterId),
        studentId: Number(bodyData.studentId),
        userId: Number(bodyData.userId),
      });
      break;

    case "update":
      await stealSessionFromParterAsync(
        Number(bodyData.sessionId),
        Number(bodyData.userId),
      );
      break;

    case "remove":
      await removeSessionAsync(Number(bodyData.sessionId));
      break;

    default:
      throw new Error("Invalid action");
  }

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const {
    userId,
    chapterId,
    students,
    sessionDateToMentorIdForAllStudentsLookup,
    selectedStudent,
    currentTerm,
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
          defaultValue={searchParams.get("selectedTerm") ?? currentTerm.name}
          options={termsList}
        />
        <Select
          label="Student"
          name="selectedStudentId"
          defaultValue={
            searchParams.get("selectedStudentId") ?? students[0]?.id.toString()
          }
          options={students.map(({ id, fullName }) => ({
            label: fullName,
            value: id.toString(),
          }))}
        />
      </Form>

      {selectedStudent && (
        <TermCalendar
          userId={userId}
          chapterId={chapterId}
          datesInTerm={datesInTerm}
          student={selectedStudent}
          sessionDateToMentorIdForAllStudentsLookup={
            sessionDateToMentorIdForAllStudentsLookup
          }
        />
      )}
    </>
  );
}
