import type { RawRuleOf, PureAbility } from "@casl/ability";
import type { Subjects } from "@casl/prisma";
import type { Chapter } from "~/prisma/client";
import type { PrismaQuery } from "~/casl-prisma";

import { createPrismaAbility } from "~/casl-prisma";

export const ACTIONS = ["manage"] as const;
export const SUBJECTS = [
  "all",
  "ChapterArea",
  "ConfigArea",
  "SchoolTermArea",
  "SessionArea",
  "StudentArea",
  "UserArea",
  "MentorAttendancesArea",
  "PermissionsArea",
  "GoalsArea",
  "Restricted",
] as const;

export type Action = (typeof ACTIONS)[number];
export type Subject =
  | (typeof SUBJECTS)[number]
  | Subjects<{
      Chapter: Chapter;
    }>;

export type Abilities = [Action, Subject];
export type AppAbility = PureAbility<Abilities, PrismaQuery>;

const IS_DEV = process.env.NODE_ENV === "development";
const IS_CI = !!process.env.CI;

export const MENTOR_ROLE_APP_ID =
  IS_DEV || IS_CI
    ? "83c9c558-9bbb-498d-8082-fc9dc1884618"
    : "a2ed7b54-4379-465d-873d-2e182e0bd8ef";

export const createAbility = (rules: RawRuleOf<AppAbility>[]) =>
  createPrismaAbility<AppAbility>(rules);
