import type { Route } from "./+types/route";

import { useNavigate, useSearchParams } from "react-router";
import {
  UserCircle,
  GraduationCap,
  ShopFourTiles,
  InfoCircle,
  EditPencil,
} from "iconoir-react";
import dayjs from "dayjs";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
  getSchoolTermsAsync,
} from "~/services/.server";
import {
  getCurrentTermForDate,
  getDistinctTermYears,
  URLSafeSearch,
} from "~/services";
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
  sessionsStatsAsync,
} from "./services.server";

import {
  MentorsOverTimeChart,
  StatCard,
  MissingReportsBarChart,
} from "./components";

export async function loader({ request }: Route.LoaderArgs) {
  const CURRENT_YEAR = dayjs().year();

  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const chapters = await getChaptersAsync(ability);

  const url = new URLSafeSearch(request.url);

  const selectedTermYear =
    url.safeSearchParams.getNullOrEmpty("selectedTermYear") ??
    CURRENT_YEAR.toString();
  const selectedTermId = url.safeSearchParams.getNullOrEmpty("selectedTermId");
  const selectedChapterId =
    chapters.length === 1
      ? chapters[0].id
      : url.safeSearchParams.getNullOrEmpty("selectedChapterId");

  const terms = await getSchoolTermsAsync();
  const currentTerm = getCurrentTermForDate(terms, new Date());

  const distinctTermYears = getDistinctTermYears(terms);
  const termsForYear = terms.filter(
    ({ year }) => year.toString() === selectedTermYear,
  );

  const selectedTerm =
    selectedTermId === null
      ? null
      : (termsForYear.find((t) => t.id.toString() === selectedTermId) ?? null);

  const selectedChapterIdNumber =
    selectedChapterId === null ? null : Number(selectedChapterId);

  const [
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
    reports,
    sessionStats,
  ] = await Promise.all([
    getTotalMentorsAsync(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
    getIncompleteMentorsAsync(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
    getTotalStudentsAsync(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
    getStudentsWithoutMentorAsync(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
    getTotalChaptersAsync(),
    getMentorsPerMonth(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
    getReportsPerSession(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
    sessionsStatsAsync(
      Number(selectedTermYear),
      selectedChapterIdNumber,
      selectedTerm,
    ),
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
        label: "Missing Report",
        data: reports.map(({ noReportCounter }) => Number(noReportCounter)),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
      },
    ],
  };

  return {
    selectedTermYear,
    selectedTermId: selectedTerm ? selectedTerm.id.toString() : "",
    selectedChapterId: selectedChapterId ? selectedChapterId.toString() : "",
    chapterOptions: [{ label: "All chapters", value: "" }].concat(
      chapters.map(({ id, name }) => ({
        label: name,
        value: id.toString(),
      })),
    ),
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
    termsOptions: [{ value: "", label: "All terms" }].concat(
      termsForYear.map(({ id, start, end, name }) => ({
        value: id.toString(),
        label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
      })),
    ),
    sessionStats,
  };
}

export default function Index({
  loaderData: {
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
    sessionStats,
  },
}: Route.ComponentProps) {
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

      <fieldset className="fieldset mb-2">
        {chapterOptions.length > 0 && (
          <Select
            label="Chapter"
            name="selectedChapterId"
            defaultValue={selectedChapterId}
            options={chapterOptions}
            onChange={onChange("selectedChapterId")}
          />
        )}

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

      <div className="flex justify-center">
        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <StatCard
            Icon={InfoCircle}
            label="Sessions attended"
            count={sessionStats.sessionCount}
            subLabel={`Since ${dayjs(sessionStats.minAttendedOn).format("MMMM YYYY")}`}
          />

          <StatCard
            Icon={EditPencil}
            label="Reports completed"
            count={sessionStats.reportCount}
            subLabel={`Since ${dayjs(sessionStats.minAttendedOn).format("MMMM YYYY")}`}
          />

          <StatCard
            Icon={UserCircle}
            label="Mentors with incomplete checks"
            count={incompleteMentors}
            subLabel={`of ${mentorsCount} total mentors`}
            to="/admin/mentors"
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

        <div className="h-96">
          <MissingReportsBarChart
            chapterId={selectedChapterId}
            data={reportsData}
          />
        </div>

        <SubTitle>Mentors recruited</SubTitle>

        <div className="h-96">
          <MentorsOverTimeChart mentorsPerMonth={mentorsPerMonth} />
        </div>
      </div>
    </>
  );
}
