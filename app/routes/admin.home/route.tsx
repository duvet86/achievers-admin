import type { LoaderFunctionArgs } from "react-router";

import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { UserCircle, GraduationCap, ShopFourTiles } from "iconoir-react";
import dayjs from "dayjs";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
  getSchoolTermsAsync,
} from "~/services/.server";
import { getCurrentTermForDate } from "~/services";
import { Select, SubTitle } from "~/components";

import {
  getChaptersAsync,
  getIncompleteMentorsAsync,
  getMentorsPerMonth,
  getReportsPerSession,
  getStudentsWithoutMentorAsync,
  getTotalChaptersAsync,
  getTotalMentorsAsync,
  getTotalStudentsAsync,
} from "./services.server";

import {
  MentorsOverTimeChart,
  StatCard,
  MissingReportsBarChart,
} from "./components";

export async function loader({ request }: LoaderFunctionArgs) {
  const CURRENT_YEAR = dayjs().year();

  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const chapters = await getChaptersAsync(ability);

  const url = new URL(request.url);
  const selectedTermYear =
    url.searchParams.get("selectedTermYear") ?? CURRENT_YEAR.toString();
  const selectedTermId = url.searchParams.get("selectedTermId");
  const selectedChapterId =
    url.searchParams.get("selectedChapterId") ?? chapters[0].id;

  const terms = await getSchoolTermsAsync();
  const currentTerm = getCurrentTermForDate(terms, new Date());

  const distinctTermYears = Array.from(new Set(terms.map(({ year }) => year)));
  const termsForYear = terms.filter(
    ({ year }) => year.toString() === selectedTermYear,
  );

  let selectedTerm = termsForYear.find(
    (t) => t.id.toString() === selectedTermId,
  );

  if (!selectedTerm) {
    if (selectedTermYear === CURRENT_YEAR.toString()) {
      selectedTerm = currentTerm;
    } else {
      selectedTerm = termsForYear[0];
    }
  }

  const [
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
    reports,
  ] = await Promise.all([
    getTotalMentorsAsync(),
    getIncompleteMentorsAsync(),
    getTotalStudentsAsync(),
    getStudentsWithoutMentorAsync(),
    getTotalChaptersAsync(),
    getMentorsPerMonth(),
    getReportsPerSession(Number(selectedChapterId), selectedTerm),
  ]);

  const reportsData = {
    labels: reports.map(({ attendedOn }) =>
      dayjs(attendedOn).format("DD/MM/YYYY"),
    ),
    datasets: [
      {
        label: "Has Report With Feedback",
        data: reports.map(({ reportWithFeedbackCounter }) =>
          Number(reportWithFeedbackCounter),
        ),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
      },
      {
        label: "Has Report No Feedback",
        data: reports.map(({ reportNoFeedbackCounter }) =>
          Number(reportNoFeedbackCounter),
        ),
        backgroundColor: "rgba(255, 205, 86, 0.8)",
      },
      {
        label: "Incomplete Report",
        data: reports.map(({ incompleteReportCounter }) =>
          Number(incompleteReportCounter),
        ),
        backgroundColor: "rgba(201, 203, 207, 0.8)",
      },
      {
        label: "Missing Report",
        data: reports.map(({ noReportCounter }) => Number(noReportCounter)),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
      },
    ],
  };

  return {
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    selectedChapterId: selectedChapterId.toString(),
    chapterOptions: chapters.map(({ id, name }) => ({
      label: name,
      value: id.toString(),
    })),
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
    reportsData,
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
  };
}

export default function Index() {
  const {
    selectedTermYear,
    selectedTermId,
    selectedChapterId,
    chapterOptions,
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
    reportsData,
    termYearsOptions,
    termsOptions,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onChange =
    (key: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      searchParams.set(key, event.target.value);

      void navigate(`?${searchParams.toString()}`);
    };

  return (
    <>
      <article className="prose relative mb-4 h-24 max-w-none">
        <div className="bg-achievers h-24 w-full rounded-md opacity-75"></div>
        <h1 className="absolute top-6 left-6 hidden lg:block">
          Welcome to Achievers Club WA admin system
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome to Achievers Club WA admin system
        </h2>
      </article>

      <div className="flex w-full justify-center">
        <div className="stats stats-vertical lg:stats-horizontal shadow-lg">
          <StatCard
            Icon={UserCircle}
            label="Mentors with incomplete checks"
            count={incompleteMentors}
            subLabel={`of ${mentorsCount} total mentors`}
            to="/admin/users"
          />

          <StatCard
            Icon={GraduationCap}
            label="Students without a mentor"
            count={studentsWithoutMentor}
            subLabel={`of ${studentsCount} total students`}
            to="/admin/students"
          />

          <StatCard
            Icon={ShopFourTiles}
            label="Chapters"
            count={chaptersCount}
            subLabel="&nbsp;"
            to="/admin/chapters"
          />
        </div>
      </div>

      <div className="w-full">
        <SubTitle>Reports completed during last session</SubTitle>

        <fieldset className="fieldset">
          <Select
            label="Chapters"
            name="selectedChapterId"
            defaultValue={selectedChapterId}
            options={chapterOptions}
            onChange={onChange("selectedChapterId")}
          />

          <div key={selectedTermId}>
            <label className="fieldset-label">Term</label>
            <div className="join w-full">
              <select
                className="select join-item basis-28"
                name="selectedTermYear"
                defaultValue={selectedTermYear}
                onChange={onChange("selectedTermYear")}
              >
                {termYearsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="select join-item w-full"
                name="selectedTermId"
                defaultValue={selectedTermId}
                onChange={onChange("selectedTermId")}
              >
                {termsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="h-96">
          <MissingReportsBarChart
            chapterId={selectedChapterId}
            data={reportsData}
          />
        </div>

        <SubTitle>Mentors over last 6 months</SubTitle>

        <div className="h-96">
          <MentorsOverTimeChart mentorsPerMonth={mentorsPerMonth} />
        </div>
      </div>
    </>
  );
}
