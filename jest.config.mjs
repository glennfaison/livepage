import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^server-only$": "<rootDir>/__tests__/utils/server-only.ts",
    "^@/client/(.*)$": "<rootDir>/client/$1",
    "^@/shared/(.*)$": "<rootDir>/shared/$1",
    "^@/server/(.*)$": "<rootDir>/server/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/(.*)$": "<rootDir>/$1",
    "^jsonpath-plus$": "<rootDir>/__tests__/utils/jsonpath-plus-mock.ts",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!.pnpm)(?!(geist|jsonpath-plus)/)",
    "/node_modules/.pnpm/(?!(geist|jsonpath-plus)@)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
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

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
