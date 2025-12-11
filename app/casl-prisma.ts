import type {
  PrismaModel,
  PrismaQueryFactory,
  PrismaTypes,
} from "@casl/prisma/runtime";

import { createAbilityFactory } from "@casl/prisma/runtime";

import type { Prisma } from "~/prisma/client";

export type { Model, Subjects } from "@casl/prisma/runtime";
export { accessibleBy, ParsingQueryError } from "@casl/prisma/runtime";
export type WhereInput<TModelName extends Prisma.ModelName> =
  PrismaTypes<Prisma.TypeMap>["WhereInput"][TModelName];
export type PrismaQuery<T extends PrismaModel = PrismaModel> =
  PrismaQueryFactory<Prisma.TypeMap, T>;
export const createPrismaAbility = createAbilityFactory<
  Prisma.ModelName,
  PrismaQuery
>();
