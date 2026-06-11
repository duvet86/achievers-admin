import type { Route } from "./+types/dev-blob.$";

import { isDevAuthBypassEnabled } from "~/services/.server/dev-auth-bypass.server";
import { readLocalBlob } from "~/services/.server/local-blob-storage.server";

// Dev-only: serves files written by the local blob-storage stand-in
// (see local-blob-storage.server.ts). Disabled outside DEV_AUTH_BYPASS.
export const loader = async ({ request }: Route.LoaderArgs) => {
  if (!isDevAuthBypassEnabled()) {
    throw new Response("Not found", { status: 404 });
  }

  const splat = decodeURIComponent(
    new URL(request.url).pathname.replace(/^\/dev-blob\//, ""),
  );
  const [containerName, ...rest] = splat.split("/");
  const blobPath = rest.join("/");

  if (!containerName || !blobPath || splat.includes("..")) {
    throw new Response("Not found", { status: 404 });
  }

  const blob = await readLocalBlob(containerName, blobPath);
  if (blob === null) {
    throw new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(blob.data), {
    headers: {
      "Content-Type": blob.contentType,
    },
  });
};
