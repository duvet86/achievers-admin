import { Form, useLoaderData, type LoaderFunctionArgs } from "react-router";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import {
  getCurrentTermForDate,
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

import { getMentorByIdAsync } from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");

  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const mentor = await getMentorByIdAsync(Number(params.mentorId));

  const terms = await getSchoolTermsForYearAsync(dayjs().year());
  const todayterm = getCurrentTermForDate(terms, new Date());

  const currentTerm =
    terms.find((t) => t.id.toString() === selectedTerm) ?? todayterm;

  return {
    termLabel: `${currentTerm.name} ${currentTerm.start.year()} (${currentTerm.start.format("D MMMM")} - ${currentTerm.end.format("D MMMM")})`,
    mentor,
    options: getSatisfactionSurveyOptions(),
  };
}

export default function Index() {
  const { termLabel, mentor, options } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to={`/chapters/1/attendances/mentors`}>
        Mentor Survey for &quot;{mentor.fullName}&quot;
      </Title>

      <SubTitle>{termLabel}</SubTitle>

      <Form method="POST">
        <Select
          name="academicSatisfaction"
          options={options}
          label="Mentor's satisfaction with student's academic progress"
        />

        <Select
          name="personalSatisfaction"
          options={options}
          label="Mentor's satisfaction with student's personal development (Attitude, Behaviour, Effort)"
        />

        <Select
          name="goals"
          options={options}
          label="Student's progress with goals"
        />

        <Select
          name="actionPlan"
          options={options}
          label="Student's progress with action plan"
        />

        <Textarea label="What strategies have been most effective in supporting this student?" />

        <Textarea label="Any barriers limiting the student's academic and personal growth?" />

        <Select
          name="achieversSatisfaction"
          options={options}
          label="Mentor's satisfaction with working in the Achievers Club environment (resources, procedures etc)"
        />

        <Textarea label="Reasons for above response" />

        <Select
          name="confidence"
          options={options}
          label="Mentor's satisfaction with own capability and confidence for this role (training, other support provided or needed)"
        />

        <Textarea label="Reasons for above response" />

        <Textarea label="Additional comments?" />

        <SubmitFormButton className="my-4 justify-between" />
      </Form>
    </>
  );
}
