import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./__tests__/browser",
  fullyParallel: false,
  reporter: "list",
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101/try",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      LIVEPAGE_NEXT_DIST_DIR: ".next-playwright",
    },
  },
  use: {
    browserName: "chromium",
  },
})
