import { RawRuleOf, PureAbility } from "@casl/ability";
import { Chapter } from "@prisma/client";
import { createPrismaAbility, PrismaQuery, Subjects } from "@casl/prisma";

export type ROLES = "Admin" | "Mentor";

export const actions = ["manage"] as const;
export const subjects = [
  "ChapterArea",
  "ConfigArea",
  "SchoolTermArea",
  "SessionArea",
  "StudentArea",
  "UserArea",
  "MentorAttendancesArea",
  "all",
] as const;

export type Action = (typeof actions)[number];
export type Subject =
  | (typeof subjects)[number]
  | Subjects<{
      Chapter: Chapter;
    }>;

export type Abilities = [Action, Subject];
export type AppAbility = PureAbility<Abilities, PrismaQuery>;

const IS_DEV = process.env.NODE_ENV === "development";
const IS_CI = !!process.env.CI;

export const ROLE_MAPPINGS: Record<ROLES, string> = {
  Admin:
    IS_DEV || IS_CI
      ? "f1f43596-ed2b-4044-8979-dd78ec6ebe08"
      : "e567add0-fec3-4c87-941a-05dd2e18cdfd",
  Mentor:
    IS_DEV || IS_CI
      ? "83c9c558-9bbb-498d-8082-fc9dc1884618"
      : "a2ed7b54-4379-465d-873d-2e182e0bd8ef",
} as const;

export const createAbility = (rules: RawRuleOf<AppAbility>[]) =>
  createPrismaAbility<AppAbility>(rules);
