import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "**/playwright-report",
      "**/public/build",
      "**/build",
      "**/dev_sessions",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  // ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  // {
  //   plugins: {
  //     "@typescript-eslint": tseslint.plugin,
  //   },
  //   languageOptions: {
  //     parser: tseslint.parser,
  //     parserOptions: {
  //       project: true,
  //     },
  //   },
  //   settings: {
  //     "import/internal-regex": "^~/",
  //     "import/resolver": {
  //       node: {
  //         extensions: [".ts", ".tsx"],
  //       },
  //       typescript: {
  //         alwaysTryTypes: true,
  //       },
  //     },
  //   },
  // },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    settings: {
      ...pluginReact.configs.flat.recommended.settings,
      react: {
        version: "detect",
      },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
      "import/resolver": {
        typescript: {},
      },
    },
    rules: {
      ...pluginReact.configs.flat["jsx-runtime"].rules,
    },
  },
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
  eslintConfigPrettier,
];
