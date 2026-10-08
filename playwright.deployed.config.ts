import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  testMatch: ["test-deployed-app.spec.ts", "test-deployed-app-extended.spec.ts", "test-debug.spec.ts"],
  fullyParallel: false,
  reporter: "list",
  use: {
    browserName: "chromium",
    baseURL: "https://livepagecrafter-dev.vercel.app",
    ignoreHTTPSErrors: true,
  },
})