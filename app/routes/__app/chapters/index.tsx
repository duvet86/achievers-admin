import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { getChaptersAsync } from "~/models/chapter.server";

export async function loader() {
  const chapters = await getChaptersAsync();

  return json({ chapters });
}

export default function SelectChapter() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mt-8 flex flex-wrap justify-center space-x-24 font-mono font-bold text-white">
      {data.chapters.map(({ id, name }) => (
        <Link
          key={id}
          to={id}
          className="flex h-24 basis-2/5 items-center justify-center rounded-lg bg-fuchsia-500 text-xl shadow-lg hover:bg-violet-600"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
