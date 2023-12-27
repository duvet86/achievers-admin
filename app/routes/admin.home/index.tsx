import { json } from "@remix-run/node";

import { useLoaderData, Link } from "@remix-run/react";

import {
  UserCircle,
  GraduationCap,
  ShopFourTiles,
  NavArrowRight,
} from "iconoir-react";

import {
  getIncompleteMentorsAsync,
  getMentorsPerMonth,
  getStudentsWithoutMentorAsync,
  getTotalChaptersAsync,
  getTotalMentorsAsync,
  getTotalStudentsAsync,
} from "./services.server";
import { MenotorsOverTimeChart } from "./components/MentorsOverTimeChart";
import { SubTitle } from "~/components";

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
          <div className="stat">
            <div className="stat-figure text-secondary">
              <UserCircle className="inline-block h-8 w-8 stroke-current" />
            </div>
            <div className="stat-title">Mentors with incomplete checks</div>
            <div
              className="stat-value text-secondary"
              data-testid="incompleteMentors"
            >
              {incompleteMentors}
            </div>
            <div className="stat-desc" data-testid="totalMentors">
              of {mentorsCount} total mentors
            </div>
            <div className="stat-actions col-span-2 w-max">
              <Link to="/admin/users" className="btn w-max">
                View mentors <NavArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <GraduationCap className="inline-block h-8 w-8 stroke-current" />
            </div>
            <div className="stat-title">Students without a mentor</div>
            <div className="stat-value" data-testid="totalStudents">
              {studentsWithoutMentor}
            </div>
            <div className="stat-desc">of {studentsCount} total students</div>
            <div className="stat-actions col-span-2 w-max">
              <Link to="/admin/students" className="btn w-max">
                View students <NavArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <ShopFourTiles className="inline-block h-8 w-8 stroke-current" />
            </div>
            <div className="stat-title">Chapters</div>
            <div className="stat-value" data-testid="totalChapters">
              {chaptersCount}
            </div>
            <div className="stat-desc">&nbsp;</div>
            <div className="stat-actions col-span-2 w-max">
              <Link to="/admin/chapters" className="btn w-max">
                View chapters <NavArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 h-56">
        <SubTitle>Mentors over time</SubTitle>
        <MenotorsOverTimeChart mentorsPerMonth={mentorsPerMonth} />
      </div>
    </div>
  );
}
