import {
  createMongoAbility,
  MongoAbility,
  RawRuleOf,
  ForcedSubject,
} from "@casl/ability";

export const actions = ["manage"] as const;
export const subjects = [
  "Chapter",
  "Config",
  "SchoolTerm",
  "Session",
  "Student",
  "User",
  "all",
] as const;

export type Abilities = [
  (typeof actions)[number],
  (
    | (typeof subjects)[number]
    | ForcedSubject<Exclude<(typeof subjects)[number], "all">>
  ),
];
export type AppAbility = MongoAbility<Abilities>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) =>
  createMongoAbility<AppAbility>(rules);
