import { test, expect } from '@playwright/test'

const DEPLOYED_URL = 'https://livepagecrafter-dev.vercel.app'

test.describe('Deployed LivePage app', () => {
  test('Landing page loads correctly', async ({ page }) => {
    await page.goto(DEPLOYED_URL)
    
    // Check page title
    await expect(page).toHaveTitle(/LivePage/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('LivePage')
    
    // Check CTA button
    await expect(page.locator('text=Start building')).toBeVisible()
    await expect(page.locator('text=See how it works')).toBeVisible()
    
    // Check navigation links
    await expect(page.locator('text=FAQ')).toBeVisible()
    await expect(page.locator('text=Open builder')).toBeVisible()
  })

  test('Builder page loads and shows canvas', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    
    // Wait for the builder to load
    await page.waitForLoadState('networkidle')
    
    // Check header elements
    await expect(page.locator('text=LivePage')).toBeVisible()
    await expect(page.locator('text=Command')).toBeVisible()
    await expect(page.locator('text=Templates')).toBeVisible()
    await expect(page.locator('text=Import')).toBeVisible()
    await expect(page.locator('text=Export')).toBeVisible()
    
    // Check page title input
    await expect(page.locator('#page-title')).toBeVisible()
    
    // Check mode indicator
    await expect(page.locator('text=Edit mode')).toBeVisible()
    
    // Check canvas area exists
    await expect(page.locator('text=Add Row')).toBeVisible()
  })

  test('Template catalog opens and shows templates', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Templates button
    await page.click('text=Templates')
    
    // Wait for popover to open - use the popover content
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 })
    
    // Check that templates are listed - look for any template name
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 5000 })
  })

  test('Add Row button works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Add Row
    await page.click('text=Add Row')
    
    // Should add a row to the canvas - check for the toast message
    await expect(page.locator('text=Added a new row component')).toBeVisible({ timeout: 5000 })
  })

  test('Command palette opens with Cmd+K', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Press Cmd+K (Ctrl+K on Linux)
    await page.keyboard.press('Meta+K')
    
    // Check command palette opens
    await expect(page.locator('text=Command Palette')).toBeVisible({ timeout: 5000 })
  })

  test('Switch to Preview mode works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Switch to Preview Mode button
    await page.click('text=Switch to Preview Mode')
    
    // Should show Preview mode
    await expect(page.locator('text=Preview mode')).toBeVisible({ timeout: 5000 })
  })

  test('Theme toggle works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"]').first()
    await themeToggle.click()
    
    // Should toggle theme (check for dark/light class on html)
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('Export dropdown works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Export dropdown
    await page.click('text=Export')
    
    // Check export options
    await expect(page.locator('text=Download as Shortcode')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Download as JSON')).toBeVisible()
    await expect(page.locator('text=Download as HTML')).toBeVisible()
    await expect(page.locator('text=Preview Export')).toBeVisible()
    await expect(page.locator('text=Copy HTML to Clipboard')).toBeVisible()
  })

  test('Import dropdown works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Click Import dropdown
    await page.click('text=Import')
    
    // Check import options
    await expect(page.locator('text=Import Shortcode')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Import JSON')).toBeVisible()
  })

  test('History popover works for undo/redo', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click History button to open popover
    await page.click('button[title="History"]')
    
    // Check history popover opens - look for the heading
    await expect(page.locator('h2:has-text("History")')).toBeVisible({ timeout: 5000 })
    
    // Check there's a history entry - use the first matching element
    await expect(page.locator('text=Added a new row component to the page.').first()).toBeVisible()
    
    // Close popover
    await page.keyboard.press('Escape')
  })

  test('Page title can be edited', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Find page title input and edit it
    const titleInput = page.locator('#page-title')
    await titleInput.fill('Test Page Title')
    
    // Check value was set
    await expect(titleInput).toHaveValue('Test Page Title')
  })

  test('Toolbar minimize/expand works', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Find toolbar minimize button
    const minimizeButton = page.locator('button[aria-label*="minimize"], button[aria-label*="Minimize"]').first()
    
    if (await minimizeButton.isVisible({ timeout: 3000 })) {
      await minimizeButton.click()
      
      // Check toolbar is minimized
      await expect(page.locator('button[aria-label*="expand"], button[aria-label*="Expand"]')).toBeVisible({ timeout: 3000 })
    }
  })

  test('No console errors on builder page', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('manifest') &&
      !e.includes('DevTools')
    )
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors)
    }
    
    expect(criticalErrors.length).toBe(0)
  })

  test('Responsive design works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${DEPLOYED_URL}/try`)
    await page.waitForLoadState('networkidle')
    
    // Check header still works on mobile
    await expect(page.locator('text=LivePage')).toBeVisible()
    
    // Check canvas is visible
    await expect(page.locator('text=Add Row')).toBeVisible()
  })

  test('Landing page has proper meta tags', async ({ page }) => {
    await page.goto(DEPLOYED_URL)
    
    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
    
    // Check description meta tag
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /.+/)
  })
})