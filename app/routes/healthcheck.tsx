// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { prisma } from "~/db.server";
import { trackException } from "~/services";

export async function loader() {
  try {
    await prisma.chapter.count();

    return new Response("OK");
  } catch (error: unknown) {
    console.error("healthcheck ❌", { error });

    trackException({
      exception: error as Error,
    });

    return new Response("ERROR", { status: 500 });
  }
}
