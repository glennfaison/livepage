import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^server-only$": "<rootDir>/__tests__/utils/server-only.ts",
    "^@/client/(.*)$": "<rootDir>/client/$1",
    "^@/shared/(.*)$": "<rootDir>/shared/$1",
    "^@/server/(.*)$": "<rootDir>/server/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/vercel/analytics/next$": "<rootDir>/__tests__/utils/vercel-mock.tsx",
    "^@/vercel/speed-insights/next$": "<rootDir>/__tests__/utils/vercel-mock.tsx",
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "client/**/*.{js,jsx,ts,tsx}",
    "shared/**/*.{js,jsx,ts,tsx}",
    "server/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/__tests__/utils/",
    "<rootDir>/__tests__/browser/",
    "<rootDir>/__tests__/.*/data.ts"
  ],
}

export default createJestConfig(customJestConfig)
