import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { SessionCommand } from "./services.server";

import {
  Form,
  json,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import dayjs from "dayjs";

import { getCurrentUserADIdAsync, getUserByAzureADIdAsync } from "~/services";
import { Select, Title } from "~/components";

import {
  createSessionAsync,
  getCurrentTermForDate,
  getDatesForTerm,
  getMentorStudentsAsync,
  getSchoolTermsForYearAsync,
} from "./services.server";
import TermCalendar from "./components/TermCalendar";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId, true);

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const students = await getMentorStudentsAsync(user.id);

  return json({
    chapterId: user.userAtChapter[0].chapterId,
    termsList: terms,
    currentTerm,
    students,
    datesInTerm: getDatesForTerm(currentTerm),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const bodyData: SessionCommand = await request.json();

  await createSessionAsync(
    {
      attendedOn: bodyData.attendOn,
      chapterId: Number(bodyData.chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    },
    {
      attendedOn: bodyData.attendOn,
      chapterId: Number(bodyData.chapterId),
      studentId: Number(bodyData.studentId),
      userId: Number(bodyData.userId),
    },
  );

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const { chapterId, students, currentTerm, termsList, datesInTerm } =
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
          options={termsList.map(({ name }) => ({
            label: name,
            value: name,
          }))}
        />
      </Form>

      <TermCalendar
        chapterId={chapterId}
        datesInTerm={datesInTerm}
        students={students}
      />
    </>
  );
}
