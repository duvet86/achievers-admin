import { defineConfig } from "eslint/config";

import eslintJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
  {
    ignores: [
      "**/playwright-report",
      "**/public/build",
      "**/build",
      "**/dev_sessions",
      "**/tailwind.config.*",
      ".react-router",
      "**/prisma/client",
    ],
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["**/*.ts", "**/*.tsx"],

    // Extend recommended rule sets from:
    // 1. ESLint JS's recommended rules
    // 2. TypeScript ESLint recommended rules
    // 3. ESLint React's recommended-typescript rules
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      eslintReact.configs["recommended-typescript"],
    ],

    // Configure language/parsing options
    languageOptions: {
      // Use TypeScript ESLint parser for TypeScript files
      parser: tseslint.parser,
      parserOptions: {
        // Enable project service for better TypeScript integration
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/consistent-generic-constructors": "off", // not required.
      "@eslint-react/static-components": "off",
      "@eslint-react/no-array-index-key": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
    },
  },
  eslintConfigPrettier,
]);
