import { expect, test } from "@playwright/test"

/**
 * Smoke (Playwright): main routes load without fatal errors and a template
 * opens and renders. Keep this file small; it runs on every pull request.
 */
test.slow()

const SMOKE_TEMPLATE_ID = "cv-resume-personal-website"

test("landing page loads without page errors", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  const response = await page.goto("/")
  expect(response?.ok()).toBe(true)
  await expect(page.locator("body")).not.toBeEmpty()
  expect(errors).toEqual([])
})

test("builder route loads with its toolbar", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  const response = await page.goto("/try")
  expect(response?.ok()).toBe(true)
  await expect(page.getByTestId("toolbar-settings-trigger")).toBeVisible()
  expect(errors).toEqual([])
})

test("a template renders in preview with visible content and no horizontal overflow", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  const response = await page.goto(`/preview/${SMOKE_TEMPLATE_ID}`)
  expect(response?.ok()).toBe(true)
  await page.waitForSelector("main, header", { timeout: 15_000 })
  const metrics = await page.evaluate(() => ({
    text: document.body.innerText.trim().length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  expect(metrics.text).toBeGreaterThan(50)
  expect(metrics.overflow).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
})
