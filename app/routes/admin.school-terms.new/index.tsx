import type { ActionFunctionArgs } from "@remix-run/node";
import type { NewSchoolTerm } from "./services.server";

import { Form, json, redirect, useActionData } from "@remix-run/react";
import dayjs from "dayjs";

import {
  BackHeader,
  DateInput,
  SubTitle,
  SubmitFormButton,
  Title,
} from "~/components";

import { addTermsAsync, getExisitingYearsAsync } from "./services.server";
import { areDatesOverlapping } from "~/services";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const startDate1 = dayjs(
    formData.get("startDate0")!.toString(),
    "YYYY-MM-DD",
  );
  const startDate2 = dayjs(
    formData.get("startDate1")!.toString(),
    "YYYY-MM-DD",
  );
  const startDate3 = dayjs(
    formData.get("startDate2")!.toString(),
    "YYYY-MM-DD",
  );
  const startDate4 = dayjs(
    formData.get("startDate3")!.toString(),
    "YYYY-MM-DD",
  );

  const endDate1 = dayjs(formData.get("endDate0")!.toString(), "YYYY-MM-DD");
  const endDate2 = dayjs(formData.get("endDate1")!.toString(), "YYYY-MM-DD");
  const endDate3 = dayjs(formData.get("endDate2")!.toString(), "YYYY-MM-DD");
  const endDate4 = dayjs(formData.get("endDate3")!.toString(), "YYYY-MM-DD");

  const commonYear = startDate1.year();

  const datesWithDifferrentYears = [
    startDate1,
    startDate2,
    startDate3,
    startDate4,
    endDate1,
    endDate2,
    endDate3,
    endDate4,
  ].filter((date) => date.year() !== commonYear);

  if (datesWithDifferrentYears.length > 0) {
    return json({
      errorMessage: "Dates have different years",
    });
  }

  const existingYears = await getExisitingYearsAsync();

  if (existingYears.includes(commonYear)) {
    return json({
      errorMessage: `Year ${commonYear} already exists`,
    });
  }

  const newTerms: NewSchoolTerm[] = [
    {
      year: commonYear,
      startDate: dayjs(startDate1, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate1, "YYYY-MM-DD").toDate(),
    },
    {
      year: commonYear,
      startDate: dayjs(startDate2, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate2, "YYYY-MM-DD").toDate(),
    },
    {
      year: commonYear,
      startDate: dayjs(startDate3, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate3, "YYYY-MM-DD").toDate(),
    },
    {
      year: commonYear,
      startDate: dayjs(startDate4, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate4, "YYYY-MM-DD").toDate(),
    },
  ];

  if (areDatesOverlapping(newTerms)) {
    return json({
      errorMessage: "End date before start date or overlapping terms",
    });
  }

  await addTermsAsync(newTerms);

  return redirect(`/admin/school-terms/${commonYear}`);
}

export default function Index() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      <BackHeader to="/admin/school-terms" />

      <Title>Add new school term</Title>

      <Form method="post" className="flex flex-col gap-6">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="rounded bg-gray-100 p-4 shadow-xl">
              <SubTitle>Term {index + 1}</SubTitle>
              <DateInput
                label="Start date"
                name={`startDate${index}`}
                required
              />
              <DateInput label="End date" name={`endDate${index}`} required />
            </div>
          ))}

        <SubmitFormButton
          sticky
          className="justify-between"
          errorMessage={actionData?.errorMessage}
        />
      </Form>
    </>
  );
}
