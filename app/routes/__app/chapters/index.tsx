import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { getChaptersAsync } from "~/services/chapter.server";

export async function loader() {
  const chapters = await getChaptersAsync();

  return json({ chapters });
}

export default function Chapters() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mt-8 flex flex-wrap justify-center font-mono font-bold text-white lg:space-x-24">
      {data.chapters.map(({ id, name }) => (
        <Link
          key={id}
          to={id}
          className="mb-8 flex h-24 w-full items-center justify-center rounded-lg bg-neutral-content text-xl shadow-lg hover:bg-primary lg:w-1/3"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
