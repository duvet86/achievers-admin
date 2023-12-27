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

import { MenotorsOverTimeChart } from "./components/MentorsOverTimeChart";
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
    <div className="-m-4 h-full bg-lines p-4">
      <article className="prose relative mb-8 h-24 max-w-none">
        <div className="h-24 w-full rounded-md bg-achievers opacity-75"></div>
        <h1 className="absolute left-6 top-6">
          Welcome to Achievers Club WA admin system
        </h1>
      </article>

      <div className="flex w-full justify-center">
        <div className="stats w-4/5 shadow-lg">
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
        <MenotorsOverTimeChart mentorsPerMonth={mentorsPerMonth} />
      </div>
    </div>
  );
}
