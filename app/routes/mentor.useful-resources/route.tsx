import type { Route } from "./+types/route";

import { SubTitle, Title } from "~/components";
import { getMentorResourcesAsync } from "./services.server";
import { Fragment } from "react/jsx-runtime";

export async function loader() {
  const mentorResources = await getMentorResourcesAsync();

  return { mentorResources };
}

export default function Index({
  loaderData: { mentorResources },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Useful resources</Title>

      {mentorResources.map(({ id, label, mentorResource }) => (
        <Fragment key={id}>
          <SubTitle>{label}</SubTitle>

          <ul className="m-4 list-inside list-disc">
            {mentorResource.map(({ id, label, description, url }) => (
              <li key={id} className="mb-2">
                <a className="link" href={url} target="_blank" rel="noreferrer">
                  {label}
                </a>
                <p className="text-sm italic">{description}</p>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}
