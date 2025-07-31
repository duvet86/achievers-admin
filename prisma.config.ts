import path from "node:path";
import { defineConfig } from "prisma/config";

import "dotenv/config";

export default defineConfig({
  experimental: {
    adapter: true,
  },
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
