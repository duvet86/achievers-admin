import type { Route } from "./+types/route";
import type { SchoolTermCommand } from "./services.server";

import { Form, redirect } from "react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { isLoggedUserBlockedAsync, trackException } from "~/services/.server";
import { areDatesOverlapping } from "~/services";
import { DateInput, SubTitle, SubmitFormButton, Title } from "~/components";

import { addTermsAsync, getExisitingYearsAsync } from "./services.server";

dayjs.extend(utc);

export async function loader({ request }: Route.LoaderArgs) {
  const isUserBlocked = await isLoggedUserBlockedAsync(
    request,
    "SchoolTermArea",
  );

  if (isUserBlocked) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no SchoolTermArea permissions.`,
      ),
    );
    throw redirect("/403");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const startDate1 = dayjs.utc(
    formData.get("startDate0") as string,
    "YYYY-MM-DD",
  );
  const startDate2 = dayjs.utc(
    formData.get("startDate1") as string,
    "YYYY-MM-DD",
  );
  const startDate3 = dayjs.utc(
    formData.get("startDate2") as string,
    "YYYY-MM-DD",
  );
  const startDate4 = dayjs.utc(
    formData.get("startDate3") as string,
    "YYYY-MM-DD",
  );

  const endDate1 = dayjs.utc(formData.get("endDate0") as string, "YYYY-MM-DD");
  const endDate2 = dayjs.utc(formData.get("endDate1") as string, "YYYY-MM-DD");
  const endDate3 = dayjs.utc(formData.get("endDate2") as string, "YYYY-MM-DD");
  const endDate4 = dayjs.utc(formData.get("endDate3") as string, "YYYY-MM-DD");

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
    return {
      successMessage: null,
      errorMessage: "Dates have different years",
    };
  }

  const existingYears = await getExisitingYearsAsync();

  if (existingYears.includes(commonYear)) {
    return {
      successMessage: null,
      errorMessage: `Year ${commonYear} already exists`,
    };
  }

  const newTerms: SchoolTermCommand[] = [
    {
      year: commonYear,
      startDate: dayjs.utc(startDate1, "YYYY-MM-DD").toDate(),
      endDate: dayjs.utc(endDate1, "YYYY-MM-DD").toDate(),
      label: "Term 1",
    },
    {
      year: commonYear,
      startDate: dayjs.utc(startDate2, "YYYY-MM-DD").toDate(),
      endDate: dayjs.utc(endDate2, "YYYY-MM-DD").toDate(),
      label: "Term 2",
    },
    {
      year: commonYear,
      startDate: dayjs.utc(startDate3, "YYYY-MM-DD").toDate(),
      endDate: dayjs.utc(endDate3, "YYYY-MM-DD").toDate(),
      label: "Term 3",
    },
    {
      year: commonYear,
      startDate: dayjs.utc(startDate4, "YYYY-MM-DD").toDate(),
      endDate: dayjs.utc(endDate4, "YYYY-MM-DD").toDate(),
      label: "Term 4",
    },
  ];

  if (areDatesOverlapping(newTerms)) {
    return {
      successMessage: null,
      errorMessage: "End date before start date or overlapping terms",
    };
  }

  await addTermsAsync(newTerms);

  return {
    successMessage: "Terms added successfully",
    errorMessage: null,
  };
}

export default function Index({ actionData }: Route.ComponentProps) {
  return (
    <>
      <Title className="mb-4">Add new school term</Title>

      <Form method="post" className="flex flex-col gap-6">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="rounded-sm bg-gray-100 p-4 shadow-xl">
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
          successMessage={actionData?.successMessage}
          errorMessage={actionData?.errorMessage}
        />
      </Form>
    </>
  );
}
