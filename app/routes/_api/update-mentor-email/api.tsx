import type { Route } from "./+types/api";

import invariant from "tiny-invariant";
import {
  isUniqueEmailAsync,
  udpdateInvitedMentorEmailAsync,
} from "./services.server";

interface JsonRequest {
  email: string;
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  const mentorId = Number(params.mentorId);

  const jsonRequest = (await request.json()) as JsonRequest;
  if (!jsonRequest.email.trim()) {
    throw new Error("Invalid email.");
  }

  const isUniqueEmail = await isUniqueEmailAsync(jsonRequest.email);

  if (!isUniqueEmail) {
    return Response.json({ message: "Email is already in use." });
  }

  await udpdateInvitedMentorEmailAsync(request, mentorId, jsonRequest.email);

  return Response.json({ message: "Email updated." });
}
