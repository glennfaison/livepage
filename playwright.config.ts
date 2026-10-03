import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./__tests__/browser",
  fullyParallel: false,
  reporter: "list",
  use: {
    browserName: "chromium",
  },
})
