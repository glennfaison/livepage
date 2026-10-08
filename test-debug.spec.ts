import { test, expect } from '@playwright/test'

const DEPLOYED_URL = 'https://livepagecrafter-dev.vercel.app'

test.describe('Debug failing features', () => {
  test('Debug template application', async ({ page }) => {
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
    
    // Click Templates button
    await page.click('text=Templates')
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 })
    
    // Click on the Apply button for the first template
    const firstApplyButton = page.locator('button[aria-label^="Apply"]').first()
    await firstApplyButton.click()
    
    // Wait and check for errors
    await page.waitForTimeout(2000)
    
    console.log('Console errors during template application:', errors)
    
    // Check if template was applied by looking for canvas content
    const canvasContent = await page.locator('main').textContent()
    console.log('Canvas content after template apply:', canvasContent?.substring(0, 500))
  })

  test('Debug Preview Export', async ({ page }) => {
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
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Export dropdown
    await page.click('text=Export')
    await expect(page.locator('text=Preview Export')).toBeVisible({ timeout: 5000 })
    
    // Click Preview Export
    await page.click('text=Preview Export')
    
    // Wait and check for errors
    await page.waitForTimeout(3000)
    
    console.log('Console errors during Preview Export:', errors)
    
    // Check if validation dialog appeared
    const validationDialog = page.locator('text=Validation, text=validation')
    if (await validationDialog.isVisible({ timeout: 1000 })) {
      console.log('Validation dialog appeared')
      await page.click('button:has-text("Proceed")')
      await page.waitForTimeout(2000)
      console.log('Console errors after proceed:', errors)
    }
  })

  test('Debug Copy HTML to Clipboard', async ({ page }) => {
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
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Export dropdown
    await page.click('text=Export')
    await expect(page.locator('text=Copy HTML to Clipboard')).toBeVisible({ timeout: 5000 })
    
    // Click Copy HTML to Clipboard
    await page.click('text=Copy HTML to Clipboard')
    
    // Wait and check for errors
    await page.waitForTimeout(3000)
    
    console.log('Console errors during Copy HTML:', errors)
    
    // Check if validation dialog appeared
    const validationDialog = page.locator('text=Validation, text=validation')
    if (await validationDialog.isVisible({ timeout: 1000 })) {
      console.log('Validation dialog appeared')
      await page.click('button:has-text("Proceed")')
      await page.waitForTimeout(2000)
      console.log('Console errors after proceed:', errors)
    }
  })

  test('Debug Discard changes', async ({ page }) => {
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
    
    // Add a row first
    await page.click('text=Add Row')
    await page.waitForTimeout(500)
    
    // Click Discard button (X icon)
    await page.click('button[title="Discard"]')
    
    // Wait and check for errors
    await page.waitForTimeout(2000)
    
    console.log('Console errors during Discard:', errors)
    
    // Check for any dialog
    const dialogs = page.locator('[role="dialog"], [role="alertdialog"]')
    const dialogCount = await dialogs.count()
    console.log('Dialog count:', dialogCount)
    for (let i = 0; i < dialogCount; i++) {
      const text = await dialogs.nth(i).textContent()
      console.log(`Dialog ${i}:`, text)
    }
  })
})