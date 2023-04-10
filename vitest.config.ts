/// <reference types="vitest" />
/// <reference types="vite/client" />

import { configDefaults, defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup-test-env.ts"],
    exclude: [...configDefaults.exclude, "integration-tests/tests/*"],
    minThreads: process.env.CI ? 1 : undefined,
    maxThreads: process.env.CI ? 1 : undefined,
  },
});
