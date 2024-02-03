import type { AzureUserWebAppWithRole } from "~/services";

import { useRouteData } from "~/services";

// export async function loader() {}

export default function Index() {
  const { currentUser } = useRouteData<{
    currentUser: AzureUserWebAppWithRole;
  }>("routes/mentor");

  return (
    <div className="-m-4 h-full p-4">
      <article className="prose relative mb-8 h-24 max-w-none lg:h-28">
        <div className="h-24 w-full rounded-md bg-achievers opacity-75 lg:h-28"></div>
        <h1 className="absolute left-6 top-6 hidden lg:block">
          Welcome {currentUser.displayName}
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome {currentUser.displayName}
        </h2>
      </article>

      <div>Next session:</div>
    </div>
  );
}
