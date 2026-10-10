import { expect, test, type Locator, type Page } from "@playwright/test"

const APP_URL = "http://127.0.0.1:3101/try"
const TOOLBAR_SETTINGS_TRIGGER = '[data-testid="toolbar-settings-trigger"]'
const COMPONENT_SETTINGS_TRIGGER = '[data-testid="component-settings-trigger"]'

// The dev server compiles the app on first request, so every test here pays the
// cold-start cost; three times the default timeout keeps that from flaking.
test.use({ viewport: { width: 1280, height: 720 } })
test.slow()

async function openSettingsPanel(page: Page): Promise<Locator> {
  await page.locator(TOOLBAR_SETTINGS_TRIGGER).click()
  const panel = page.getByRole("dialog")
  await expect(panel).toBeVisible()
  return panel
}

async function expectInsideViewport(page: Page, panel: Locator): Promise<void> {
  const viewport = page.viewportSize()!
  const box = (await panel.boundingBox())!
  expect(box.x, "left edge inside viewport").toBeGreaterThanOrEqual(0)
  expect(box.y, "top edge inside viewport").toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, "right edge inside viewport").toBeLessThanOrEqual(viewport.width)
  expect(box.y + box.height, "bottom edge inside viewport").toBeLessThanOrEqual(viewport.height)
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL, { waitUntil: "networkidle" })
  await expect(page.locator(TOOLBAR_SETTINGS_TRIGGER)).toBeVisible()
})

test.describe("toolbar settings panel", () => {
  test("opens fully inside the viewport instead of running past the bottom", async ({ page }) => {
    const panel = await openSettingsPanel(page)
    const box = (await panel.boundingBox())!

    await expectInsideViewport(page, panel)
    // A reasonable cap on the panel height, whatever the space below the trigger.
    expect(box.height).toBeLessThanOrEqual(600)
  })

  test("keeps every section reachable: the body scrolls under a fixed header", async ({ page }) => {
    const panel = await openSettingsPanel(page)
    const body = page.getByTestId("settings-panel-body")

    const metrics = await body.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight)

    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    await expect(panel.getByRole("button", { name: "Download as HTML" })).toBeInViewport()
    await expect(panel.getByRole("heading", { name: "Settings" })).toBeInViewport()
  })

  test("stays anchored to its trigger when the header is pressed", async ({ page }) => {
    const panel = await openSettingsPanel(page)
    const before = (await panel.boundingBox())!

    await panel.getByRole("heading", { name: "Settings" }).hover()
    await page.mouse.down()
    await page.mouse.up()

    // Radix owns the placement, so pressing the header must leave the panel
    // statically positioned and where it was rather than detaching it.
    await expect(panel).toHaveCSS("position", "static")
    const after = (await panel.boundingBox())!
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1)
    await expectInsideViewport(page, panel)
  })

  test("stays inside the viewport after a resize and reopen", async ({ page }) => {
    const panel = await openSettingsPanel(page)
    await expectInsideViewport(page, panel)

    await page.setViewportSize({ width: 900, height: 560 })
    // The toolbar re-docks and Radix re-places the panel on the same tick, so
    // allow the layout to settle before measuring.
    await expect(async () => {
      await expectInsideViewport(page, panel)
    }).toPass({ timeout: 5000 })

    await page.keyboard.press("Escape")
    await openSettingsPanel(page)
    await expectInsideViewport(page, panel)
  })
})

test.describe("component settings panel", () => {
  test("opens fully inside the viewport next to the selected component", async ({ page }) => {
    await page.getByRole("button", { name: "Add Row" }).click()
    const component = page.locator("[data-component-id]").first()
    await expect(component).toBeVisible()
    await component.click()

    await page.locator(COMPONENT_SETTINGS_TRIGGER).first().click()
    // The panel is inset by -m-1, so measure the panel itself, not the dialog.
    const panel = page.getByTestId("component-settings-panel")
    await expect(panel).toBeVisible()

    await expectInsideViewport(page, panel)
    expect((await panel.boundingBox())!.height).toBeLessThanOrEqual(600)

    await page.mouse.wheel(0, 300)
    await expect(async () => {
      await expectInsideViewport(page, panel)
    }).toPass({ timeout: 5000 })
  })
})
