import type {
  PrismaModel,
  PrismaQueryOf,
  WhereInputOf,
} from "@casl/prisma/runtime";
import type { Prisma } from "~/prisma/client";

import {
  accessibleBy,
  createPrismaAbility,
  ParsingQueryError,
  prismaQuery,
} from "@casl/prisma/runtime";

export { accessibleBy, createPrismaAbility, ParsingQueryError, prismaQuery };

export type PrismaQuery<T extends PrismaModel = PrismaModel> = PrismaQueryOf<
  Prisma.TypeMap,
  T
>;
export type WhereInput<TModelName extends Prisma.ModelName> = WhereInputOf<
  Prisma.TypeMap,
  TModelName
>;
