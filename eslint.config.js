import js from "@eslint/js"
import filenameExport from "eslint-plugin-filename-export"
import prettier from "eslint-plugin-prettier/recommended"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  globalIgnores(["dist", ".wrangler", "node_modules"]),
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat["recommended-latest"],
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    settings: { react: { version: "detect" } },
    plugins: { "react-refresh": reactRefresh, "filename-export": filenameExport },
    rules: {
      "no-console": "error",
      "no-duplicate-case": "error",
      "no-nested-ternary": "error",
      "no-return-await": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "react/jsx-key": "error",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
    },
  },
  {
    // a component, hook or store lives in a file of its own name
    files: ["src/components/**", "src/hooks/**", "src/store/**", "src/App.tsx"],
    rules: {
      "filename-export/match-named-export": "error",
      "filename-export/match-default-export": "error",
    },
  },
  {
    files: ["src/**"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["scripts/**", "server/**", "functions/**", "test/**", "vite.config.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    // vitest types its asymmetric matchers, such as expect.stringContaining(), as any
    files: ["test/**"],
    rules: { "@typescript-eslint/no-unsafe-assignment": "off" },
  },
  {
    // the scripts are command-line tools: what they print is their output
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
  prettier,
  { rules: { curly: ["error", "all"] } }
)
