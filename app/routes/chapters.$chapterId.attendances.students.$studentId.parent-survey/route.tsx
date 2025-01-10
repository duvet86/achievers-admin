import { Form, useLoaderData, type LoaderFunctionArgs } from "react-router";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import {
  getCurrentTermForDate,
  getHappinessSurveyOptions,
  getSatisfactionSurveyOptions,
} from "~/services";
import { getSchoolTermsForYearAsync } from "~/services/.server";
import {
  Select,
  SubmitFormButton,
  SubTitle,
  Textarea,
  Title,
} from "~/components";

import { getStudentByIdAsync, getChaptersAsync } from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const [chapters, student] = await Promise.all([
    getChaptersAsync(),
    getStudentByIdAsync(Number(params.studentId)),
  ]);

  const terms = await getSchoolTermsForYearAsync(dayjs().year());
  const todayterm = getCurrentTermForDate(terms, new Date());

  const currentTerm =
    terms.find((t) => t.id.toString() === selectedTerm) ?? todayterm;

  return {
    chapters: chapters.map(({ name, id }) => ({
      label: name,
      value: id.toString(),
    })),
    termLabel: `${currentTerm.name} ${currentTerm.start.year()} (${currentTerm.start.format("D MMMM")} - ${currentTerm.end.format("D MMMM")})`,
    student,
    satisfactionOptions: getSatisfactionSurveyOptions(),
    happinessOptions: getHappinessSurveyOptions(),
  };
}

export default function Index() {
  const {
    chapters,
    termLabel,
    student,
    satisfactionOptions,
    happinessOptions,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to={`/chapters/1/attendances/students`}>
        Parent Survey for &quot;{student.fullName}&quot; (Re-enrolment)
      </Title>

      <SubTitle>{termLabel}</SubTitle>

      <Form method="POST">
        <Select
          name="chapter"
          options={chapters}
          label="Which Chapter of Achievers Club does your child attend?"
        />

        <Select
          name="academicSatisfaction"
          options={happinessOptions}
          label="How happy is your child at school?"
        />

        <Select
          name="childSatisfaction"
          options={satisfactionOptions}
          label="How satisfied are you with your child's level of reading, writing, and spelling?"
        />

        <Select
          name="homework"
          options={satisfactionOptions}
          label="How comfortable is your child doing homework on their own?"
        />

        <Select
          name="friends"
          options={satisfactionOptions}
          label="How happy are you with your child's ability to make friends?"
        />

        <Select
          name="academicProgress"
          options={satisfactionOptions}
          label="How satisfied are you with your chil's academic progress at school in the last year?"
        />

        <Textarea
          label="How satisfied are you with the mentoring support received last year through the Achievers Club?"
          name="mentoringSupport"
        />

        <Textarea
          label="Is there anything that you would like your child's mentor to help them achieve this/next year?"
          name="mentorHelp"
        />

        <Textarea
          label="Please include any feedback or additional comments you'd like to make."
          name="feedback"
        />

        <SubmitFormButton className="my-4 justify-between" />
      </Form>
    </>
  );
}
