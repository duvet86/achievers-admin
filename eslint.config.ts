import { defineConfig } from "eslint/config";

import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
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
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/consistent-generic-constructors": "off", // not required.
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...pluginReact.configs.flat.recommended,
    // settings: {
    //   react: {
    //     version: "detect",
    //   },
    // },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...pluginReact.configs.flat["jsx-runtime"],
  },
  // {
  //   files: ["**/*.{js,jsx,ts,tsx}"],
  //   ...pluginReact.configs.flat.recommended,
  //   languageOptions: {
  //     ...pluginReact.configs.flat.recommended.languageOptions,
  //     globals: {
  //       ...globals.node,
  //       ...globals.browser,
  //     },
  //   },
  //   settings: {
  //     react: {
  //       version: "detect",
  //     },
  //     formComponents: ["Form"],
  //     linkComponents: [
  //       { name: "Link", linkAttribute: "to" },
  //       { name: "NavLink", linkAttribute: "to" },
  //     ],
  //     "import/resolver": {
  //       typescript: {},
  //     },
  //   },
  //   rules: {
  //     ...pluginReact.configs.recommended.rules,
  //     ...pluginReact.configs.flat["jsx-runtime"].rules,
  //     "react/jsx-key": [
  //       2,
  //       { checkFragmentShorthand: true, warnOnDuplicates: true },
  //     ],
  //   },
  // },
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
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
