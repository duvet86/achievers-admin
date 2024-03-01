import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import {
  Form,
  json,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import dayjs from "dayjs";

import {
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";
import { getDatesForTerm } from "~/services";
import { Select, Title } from "~/components";

import {
  createSessionAsync,
  getCurrentTermForDate,
  getStudentsAsync,
  getSchoolTermsForYearAsync,
  removeSessionAsync,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export interface SessionCommandRequest {
  action: "assign" | "remove";
  chapterId: number;
  studentId: number;
  userId: number;
  attendedOn: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");
  const selectedStudentId = url.searchParams.get("selectedStudentId");

  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

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
  const bodyData: SessionCommandRequest = await request.json();

  const action = bodyData.action;

  if (action === "assign") {
    await createSessionAsync({
      attendedOn: bodyData.attendedOn,
      chapterId: Number(bodyData.chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    });
  } else {
    await removeSessionAsync({
      attendedOn: bodyData.attendedOn,
      chapterId: Number(bodyData.chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    });
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
          options={students.map(({ id, firstName, lastName }) => ({
            label: `${firstName} ${lastName}`,
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
