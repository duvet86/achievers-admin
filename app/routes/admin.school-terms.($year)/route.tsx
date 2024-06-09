import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import type { SchoolTerm } from "./services.server";

import {
  Form,
  Link,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import dayjs from "dayjs";
import { Plus } from "iconoir-react";

import { areDatesOverlapping, isStringNullOrEmpty } from "~/services";
import {
  DateInput,
  Select,
  SubTitle,
  SubmitFormButton,
  Title,
} from "~/components";

import {
  updateTermsAsync,
  getAvailableYearsAsync,
  getSchoolTermsForYearAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const currentYear = dayjs().year();

  const selectedYear = isStringNullOrEmpty(params.year)
    ? currentYear
    : Number(params.year);

  const availableYears = await getAvailableYearsAsync();

  const terms = await getSchoolTermsForYearAsync(selectedYear);

  return json({
    availableYears,
    selectedYear: selectedYear.toString(),
    currentYear: currentYear.toString(),
    terms,
  });
}

export async function action({ request, params }: ActionFunctionArgs): Promise<
  TypedResponse<{
    successMessage: string | null;
    errorMessage: string | null;
  }>
> {
  const formData = await request.formData();

  const termId1 = formData.get("termId0")!.toString();
  const termId2 = formData.get("termId1")!.toString();
  const termId3 = formData.get("termId2")!.toString();
  const termId4 = formData.get("termId3")!.toString();

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
      successMessage: null,
      errorMessage: "Dates have different years",
    });
  }

  const selectedYear = isStringNullOrEmpty(params.year)
    ? dayjs().year()
    : Number(params.year);

  if (commonYear !== selectedYear) {
    return json({
      successMessage: null,
      errorMessage: "Miss matching year",
    });
  }

  const newTerms: SchoolTerm[] = [
    {
      id: Number(termId1),
      startDate: dayjs(startDate1, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate1, "YYYY-MM-DD").toDate(),
    },
    {
      id: Number(termId2),
      startDate: dayjs(startDate2, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate2, "YYYY-MM-DD").toDate(),
    },
    {
      id: Number(termId3),
      startDate: dayjs(startDate3, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate3, "YYYY-MM-DD").toDate(),
    },
    {
      id: Number(termId4),
      startDate: dayjs(startDate4, "YYYY-MM-DD").toDate(),
      endDate: dayjs(endDate4, "YYYY-MM-DD").toDate(),
    },
  ];

  if (areDatesOverlapping(newTerms)) {
    return json({
      successMessage: null,
      errorMessage: "End date before start date or overlapping terms",
    });
  }

  await updateTermsAsync(newTerms);

  return json({
    successMessage: "Success",
    errorMessage: null,
  });
}

export default function Index() {
  const { currentYear, selectedYear, availableYears, terms } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  function goToSelectedYear(event: React.ChangeEvent<HTMLSelectElement>) {
    navigate(`/admin/school-terms/${event.target.value}`);
  }

  return (
    <>
      <Title>School terms</Title>

      <div className="mb-6 flex items-end gap-6">
        <Select
          label="Select a year"
          name="selectedYear"
          defaultValue={selectedYear}
          options={availableYears.map((year) => ({
            label: currentYear === year ? `${year} - current` : year,
            value: year,
          }))}
          onChange={goToSelectedYear}
        />

        <Link to="/admin/school-terms/new" className="btn btn-primary">
          <Plus className="h-6 w-6" />
          Add new term
        </Link>
      </div>

      <Form method="post" className="flex flex-col gap-6">
        {terms.map(({ id, startDate, endDate }, index) => (
          <div key={id} className="rounded bg-gray-100 p-4 shadow-xl">
            <SubTitle>Term {index + 1}</SubTitle>
            <DateInput
              defaultValue={startDate}
              label="Start date"
              name={`startDate${index}`}
              required
            />
            <DateInput
              defaultValue={endDate}
              label="End date"
              name={`endDate${index}`}
              required
            />

            <input type="hidden" name={`termId${index}`} value={id} />
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
