import { Form, useLoaderData, type LoaderFunctionArgs } from "react-router";

import invariant from "tiny-invariant";

import {
  Input,
  Select,
  SubmitFormButton,
  SubTitle,
  Textarea,
  Title,
} from "~/components";
import { getChaptersAsync, getStudentByIdAsync } from "./services.server";
import { getSchoolTermsForYearAsync } from "~/services/.server";
import dayjs from "dayjs";
import {
  getCurrentTermForDate,
  getHappinessSurveyOptions,
  getSatisfactionSurveyOptions,
} from "~/services";

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
        Student Survey for &quot;{student.fullName}&quot;
      </Title>

      <SubTitle>{termLabel}</SubTitle>

      <Form method="POST">
        <Select
          name="chapter"
          options={chapters}
          label="Which Chapter of Achievers Club does your child attend?"
        />

        <Input
          label="What language do you primarily speak at home?"
          name="language"
        />

        <Select
          name="academicSatisfaction"
          options={happinessOptions}
          label="How happy is your child at school?"
        />

        <Select
          name="achieversSatisfaction"
          options={happinessOptions}
          label="How happy are you at Achievers Club?"
        />

        <Select
          name="childSatisfaction"
          options={satisfactionOptions}
          label="How satisfied are you with your child's level of reading, writing, and spelling?"
        />

        <Select
          name="concentration"
          options={satisfactionOptions}
          label="How happy are you with your level of concentration at school?"
        />

        <Select
          name="homework"
          options={satisfactionOptions}
          label="How comfortable are you doing your homework on your own?"
        />

        <Select
          name="friends"
          options={satisfactionOptions}
          label="How happy are you with your ability to make friends?"
        />

        <Select
          name="quetionsInClass"
          options={satisfactionOptions}
          label="How comfortable do you feel to ask a question or make a comment in class?"
        />

        <SubTitle>
          How do you feel about your current performance in the eight learning
          areas?
        </SubTitle>

        <Select
          name="english"
          options={satisfactionOptions}
          label="1) English"
        />

        <Select name="maths" options={satisfactionOptions} label="2) Maths" />

        <Select
          name="science"
          options={satisfactionOptions}
          label="3) Science"
        />

        <Select name="hass" options={satisfactionOptions} label="4) Hass" />

        <Select name="arts" options={satisfactionOptions} label="5) Arts" />

        <Select
          name="loteLanguages"
          options={satisfactionOptions}
          label="6) Lote languages"
        />

        <Select
          name="health"
          options={satisfactionOptions}
          label="7) Health & PE"
        />

        <Select
          name="tech"
          options={satisfactionOptions}
          label="8) Technology & enterprise"
        />

        <hr className="my-4 border-primary" />

        <Select
          name="improved"
          options={satisfactionOptions}
          label="Since joining the Achievers Club, how satisfied are you that your understanding and grades have improved?"
        />

        <Textarea label="What did your Mentor help you achieve this/last Term? (e.g. academic and personal development?)" />

        <Textarea label="What do you hope your Mentor will help you do or achieve this/next Term?" />

        <Textarea label="If you have any feedback, suggestions or additional comments you'd like to make, please include (for example, venue, structure of sessions, mentor, resources available)" />

        <SubmitFormButton className="my-4 justify-between" />
      </Form>
    </>
  );
}
