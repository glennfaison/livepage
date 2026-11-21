import { expect, test } from "@playwright/test"
import { getComponentTemplateRegistry } from "@/client/features/templates/component-registry"

/**
 * Visual regression tests for every registered component template.
 * Renders each in its preview route and compares against a committed baseline.
 */
const registry = getComponentTemplateRegistry()
for (const template of registry) {
  test(`preview screenshot: ${template.id}`, async ({ page }) => {
    await page.goto(`/preview/component-templates/${template.id}`)

    await page.waitForSelector("main, header", { timeout: 15_000 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`${template.id}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
}
