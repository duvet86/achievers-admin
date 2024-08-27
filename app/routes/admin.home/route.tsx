import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { UserCircle, GraduationCap, ShopFourTiles } from "iconoir-react";

import { SubTitle } from "~/components";

import {
  getIncompleteMentorsAsync,
  getMentorsPerMonth,
  getStudentsWithoutMentorAsync,
  getTotalChaptersAsync,
  getTotalMentorsAsync,
  getTotalStudentsAsync,
} from "./services.server";

import { MentorsOverTimeChart } from "./components/MentorsOverTimeChart";
import { StatCard } from "./components/StatCard";

export async function loader() {
  const [
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
  ] = await Promise.all([
    getTotalMentorsAsync(),
    getIncompleteMentorsAsync(),
    getTotalStudentsAsync(),
    getStudentsWithoutMentorAsync(),
    getTotalChaptersAsync(),
    getMentorsPerMonth(),
  ]);

  return json({
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
  });
}

export default function Index() {
  const {
    mentorsCount,
    incompleteMentors,
    studentsCount,
    studentsWithoutMentor,
    chaptersCount,
    mentorsPerMonth,
  } = useLoaderData<typeof loader>();

  return (
    <div className="-m-4 h-full p-4">
      <article className="prose relative mb-8 h-24 max-w-none lg:h-28">
        <div className="h-24 w-full rounded-md bg-achievers opacity-75 lg:h-28"></div>
        <h1 className="absolute left-6 top-6 hidden lg:block">
          Welcome to Achievers Club WA admin system
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome to Achievers Club WA admin system
        </h2>
      </article>

      <div className="flex w-full justify-center">
        <div className="stats stats-vertical w-4/5 shadow-lg lg:stats-horizontal lg:w-full">
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

      <div className="mt-8 h-56">
        <SubTitle>Mentors over time</SubTitle>

        <MentorsOverTimeChart mentorsPerMonth={mentorsPerMonth} />
      </div>
    </div>
  );
}
