// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { prisma } from "~/db.server";

export async function loader() {
  try {
    await prisma.chapter.count();

    return new Response("OK");
  } catch (error: unknown) {
    console.error("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
