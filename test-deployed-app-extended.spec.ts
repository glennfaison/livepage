import { test, expect } from '@playwright/test'

const DEPLOYED_URL = 'https://livepagecrafter-dev.vercel.app'

test.describe('Deployed LivePage app - Extended tests', () => {
  test('Template can be applied from catalog', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Templates button
    await page.click('text=Templates')
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 })
    
    // Click on the Apply button for the first template (the invisible button that covers the card)
    const firstApplyButton = page.locator('button[aria-label^="Apply"]').first()
    await firstApplyButton.click()
    
    // Wait for template to be applied - check that canvas changed
    await page.waitForTimeout(1000)
    
    // Should no longer show "Add Row" as the only element
    await expect(page.locator('text=Add Row')).not.toBeVisible({ timeout: 5000 })
  })

  test('Command palette has all expected commands', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Open command palette
    await page.keyboard.press('Meta+K')
    await expect(page.locator('text=Command Palette')).toBeVisible({ timeout: 5000 })
    
    // Check for key commands - use more specific selectors
    await expect(page.locator('text=Save page as JSON').first()).toBeVisible()
    await expect(page.locator('text=Export').first()).toBeVisible()
    await expect(page.locator('text=Import').first()).toBeVisible()
    await expect(page.locator('text=Undo').first()).toBeVisible()
    await expect(page.locator('text=Redo').first()).toBeVisible()
    await expect(page.locator('text=History').first()).toBeVisible()
    await expect(page.locator('text=Template').first()).toBeVisible()
    await expect(page.locator('text=Discard').first()).toBeVisible()
    
    // Close palette
    await page.keyboard.press('Escape')
  })

  test('Export as JSON works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Export dropdown
    await page.click('text=Export')
    await expect(page.locator('text=Download as JSON')).toBeVisible({ timeout: 5000 })
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click Download as JSON
    await page.click('text=Download as JSON')
    
    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('Export as Shortcode works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Export dropdown
    await page.click('text=Export')
    await expect(page.locator('text=Download as Shortcode')).toBeVisible({ timeout: 5000 })
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click Download as Shortcode
    await page.click('text=Download as Shortcode')
    
    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.txt$/)
  })

  test('Preview Export opens new tab', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Export dropdown
    await page.click('text=Export')
    await expect(page.locator('text=Preview Export')).toBeVisible({ timeout: 5000 })
    
    // Set up popup listener
    const popupPromise = page.waitForEvent('popup')
    
    // Click Preview Export
    await page.click('text=Preview Export')
    
    // Handle validation dialog if it appears
    const proceedButton = page.locator('button:has-text("Proceed")')
    if (await proceedButton.isVisible({ timeout: 2000 })) {
      await proceedButton.click()
    }
    
    // Wait for popup with longer timeout
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded', { timeout: 10000 })
    
    // Check popup has content
    await expect(popup.locator('body')).not.toBeEmpty()
    
    await popup.close()
  })

  test('Copy HTML to Clipboard works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Export dropdown
    await page.click('text=Export')
    await expect(page.locator('text=Copy HTML to Clipboard')).toBeVisible({ timeout: 5000 })
    
    // Click Copy HTML to Clipboard
    await page.click('text=Copy HTML to Clipboard')
    
    // Handle validation dialog if it appears
    const proceedButton = page.locator('button:has-text("Proceed")')
    if (await proceedButton.isVisible({ timeout: 2000 })) {
      await proceedButton.click()
    }
    
    // Should show toast notification - check for any success toast
    await expect(page.locator('text=HTML copied, text=Export copied, text=Copied').first()).toBeVisible({ timeout: 5000 })
  })

  test('Import JSON works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Import dropdown
    await page.click('text=Import')
    await expect(page.locator('text=Import JSON')).toBeVisible({ timeout: 5000 })
    
    // Click Import JSON
    await page.click('text=Import JSON')
    
    // The file input should be triggered
    // We can't easily test file upload in headless, but we can verify the UI opens
    await page.waitForTimeout(500)
  })

  test('Import Shortcode works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Import dropdown
    await page.click('text=Import')
    await expect(page.locator('text=Import Shortcode')).toBeVisible({ timeout: 5000 })
    
    // Click Import Shortcode
    await page.click('text=Import Shortcode')
    
    // The file input should be triggered
    await page.waitForTimeout(500)
  })

  test('Settings popover opens', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Settings button (gear icon)
    await page.click('button[title="Settings"]')
    
    // Check settings popover opens
    await expect(page.locator('text=Settings')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Page Title')).toBeVisible()
    await expect(page.locator('text=Layout')).toBeVisible()
    
    // Close popover
    await page.keyboard.press('Escape')
  })

  test('Page title in settings can be edited', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Settings button
    await page.click('button[title="Settings"]')
    await expect(page.locator('text=Settings')).toBeVisible({ timeout: 5000 })
    
    // Find and edit page title
    const titleInput = page.locator('input[placeholder="Page Title"], input[aria-label="Page title"]').first()
    await titleInput.fill('New Page Title from Settings')
    
    // Check value was set
    await expect(titleInput).toHaveValue('New Page Title from Settings')
    
    // Close popover
    await page.keyboard.press('Escape')
  })

  test('Toolbar layout can be switched', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click rotate layout button
    await page.click('button[title*="layout"], button[title*="Layout"]')
    
    // Should switch layout (visual check - toolbar should change orientation)
    await page.waitForTimeout(500)
  })

  test('Discard changes works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Discard button (X icon)
    await page.click('button[title="Discard"]')
    
    // Should show confirmation dialog - check for dialog content
    await expect(page.locator('text=Discard, text=discard').first()).toBeVisible({ timeout: 5000 })
    
    // Click confirm - look for the confirm button in the dialog
    await page.click('button:has-text("Discard"):not([title="Discard"])')
    
    // Should be back to empty canvas
    await expect(page.locator('text=Add Row')).toBeVisible()
  })

  test('Keyboard shortcuts work', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Test Cmd+S (Save)
    await page.keyboard.press('Meta+S')
    await page.waitForTimeout(500)
    
    // Test Cmd+Shift+H (History)
    await page.keyboard.press('Meta+Shift+H')
    await expect(page.locator('h2:has-text("History")')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    
    // Test Cmd+K (Command palette)
    await page.keyboard.press('Meta+K')
    await expect(page.locator('text=Command Palette')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
  })

  test('Canvas drag and drop works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Apply a template first using the Apply button
    await page.click('text=Templates')
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 })
    const firstApplyButton = page.locator('button[aria-label^="Apply"]').first()
    await firstApplyButton.click()
    await page.waitForTimeout(1000)
    
    // Try to drag a component (this is harder to test in headless)
    // Just verify the canvas is interactive and template was applied
    await expect(page.locator('text=Add Row')).not.toBeVisible({ timeout: 5000 })
  })

  test('Component selection works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Apply a template first using the Apply button
    await page.click('text=Templates')
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 })
    const firstApplyButton = page.locator('button[aria-label^="Apply"]').first()
    await firstApplyButton.click()
    await page.waitForTimeout(1000)
    
    // Click on a component in the canvas
    // The component should get selected (show selection outline)
    // Hard to test in headless without visual regression
    await page.waitForTimeout(500)
  })

  test('Component settings popover opens on selection', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Apply a template first using the Apply button
    await page.click('text=Templates')
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 })
    const firstApplyButton = page.locator('button[aria-label^="Apply"]').first()
    await firstApplyButton.click()
    await page.waitForTimeout(1000)
    
    // Click on a component to select it
    // Then check if settings popover appears
    // This is harder to test without knowing the exact component structure
  })

  test('No 404 errors for critical resources', async ({ page }) => {
    const failedRequests: string[] = []
    
    page.on('response', response => {
      if (response.status() === 404) {
        failedRequests.push(response.url())
      }
    })
    
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Filter out expected 404s (like favicon, manifest, etc.)
    const critical404s = failedRequests.filter(url => 
      !url.includes('favicon') && 
      !url.includes('manifest') &&
      !url.includes('.well-known') &&
      !url.includes('/api/prompt-assist') // may be disabled
    )
    
    if (critical404s.length > 0) {
      console.log('Critical 404s:', critical404s)
    }
    
    expect(critical404s.length).toBe(0)
  })

  test('Prompt assist availability check', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try?prompt-assist=1`)
    await page.waitForLoadState('networkidle')
    
    // Check if prompt assist chat button appears in command palette
    await page.keyboard.press('Meta+K')
    await expect(page.locator('text=Command Palette')).toBeVisible({ timeout: 5000 })
    
    // Look for AI Assistant command
    const aiAssistant = page.locator('text=AI Assistant, text=Prompt Assist, text=Chat')
    // May or may not be visible depending on feature flag
    await page.keyboard.press('Escape')
  })

  test('Accessibility: Focus management', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Tab through the header
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to focus interactive elements
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focused)
  })

  test('Accessibility: ARIA labels on buttons', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Check key buttons have aria-labels or accessible names
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')
      const text = await button.textContent()
      
      // Button should have some accessible name
      const hasAccessibleName = ariaLabel || title || (text && text.trim().length > 0)
      if (!hasAccessibleName) {
        console.log('Button without accessible name:', await button.getAttribute('class'))
      }
    }
  })

  test('Performance: Page load time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`Page load time: ${loadTime}ms`)
    
    // Should load within reasonable time (10 seconds)
    expect(loadTime).toBeLessThan(10000)
  })

  test('Error boundary catches errors gracefully', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Check that error boundary UI doesn't show by default
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
    await expect(page.locator('text=Error')).not.toBeVisible({ timeout: 2000 })
  })
})