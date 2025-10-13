import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintPluginPrettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts", "vite-*.ts"],
  },

  {
    files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.app.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: pluginReact,
      "react-hooks": reactHooks,
      prettier: eslintPluginPrettier,
      import: importPlugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Disable the rule for React 17+
      "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
      "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-undef": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-dupe-class-members": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-imports": "off",
      "import/no-duplicates": ["error", { considerQueryString: true }],
      "no-empty": "error",
      "no-extra-semi": "error",
      "no-irregular-whitespace": "error",
      "no-unreachable-loop": "error",
      "no-unsafe-negation": "error",
      "valid-typeof": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "prettier/prettier": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];