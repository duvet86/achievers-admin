import type { PrismaClient } from "@prisma/client/index.js";

import { mockDeep, mockReset } from "vitest-mock-extended";

beforeEach(() => {
  mockReset(prisma);
});

const prisma = mockDeep<PrismaClient>();

export { prisma };
