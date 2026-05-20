import { Download, NavArrowRight } from "iconoir-react";

import { StateLink, Title } from "~/components";

const reports = [
  {
    label: "Mentor Demographics",
    to: "data-reports/mentor-demographics",
    download: true,
  },
  // {
  //   label: "Student Demographics",
  //   to: "student-demographics",
  // },
  // {
  //   label: "Student Grades Tracking",
  //   to: "student-grades-tracking",
  // },
];

export default function Index() {
  return (
    <>
      <Title>Data reports</Title>

      <div className="mt-4 flex flex-col items-start gap-4">
        {reports.map(({ label, to, download }) =>
          download ? (
            <a key={to} href={to} download className="btn w-72 justify-between">
              {label}
              <Download />
            </a>
          ) : (
            <StateLink key={to} to={to} className="btn w-72 justify-between">
              {label}
              <NavArrowRight />
            </StateLink>
          ),
        )}
      </div>
    </>
  );
}
