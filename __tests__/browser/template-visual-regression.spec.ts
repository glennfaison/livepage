import { expect, test } from "@playwright/test"
import { pageTemplateRegistry } from "@/client/features/templates"

/**
 * Visual regression tests for every registered page template.
 * Renders each template in preview mode and compares against a committed baseline.
 *
 * Derived from the template registry so new templates automatically get coverage.
 */
for (const template of pageTemplateRegistry) {
  test(`preview screenshot: ${template.id}`, async ({ page }) => {
    await page.goto(`/preview/${template.id}`)

    // Wait for the canvas / main content to settle.
    await page.waitForSelector("main, [data-testid='page-canvas'], .page-canvas, header", {
      timeout: 15_000,
    })

    // Give fonts / images a moment to settle.
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`${template.id}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
}
