import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server-dev/app.ts",
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [!process.env.VITEST && reactRouter(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["dotenv/config", "./test/setup-test-env.ts"],
    exclude: [...configDefaults.exclude, "integration-tests/tests/*"],
    poolOptions: {
      threads: {
        minThreads: process.env.CI ? 1 : undefined,
        maxThreads: process.env.CI ? 1 : undefined,
      },
    },
  },
}));
