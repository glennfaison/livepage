import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["client/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{
            regex: "^(?:@/server/|(?:\\.\\./)+server(?:/|$))",
            message: "Client code must depend on shared contracts, not server modules.",
          }],
        },
      ],
    },
  },
  {
    files: ["server/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{
            regex: "^(?:@/client/|(?:\\.\\./)+client(?:/|$))",
            message: "Server code must depend on shared contracts, not client modules.",
          }],
        },
      ],
    },
  },
  {
    files: ["shared/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{
            regex: "^(?:@/(?:client|server)/|(?:\\.\\./)+(?:client|server)(?:/|$))",
            message: "Shared code must remain independent of client and server modules.",
          }],
        },
      ],
    },
  },
];

export default eslintConfig;
