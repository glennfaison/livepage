import { test, expect } from "@playwright/test"

test("toolbar undo/redo buttons enable after edits", async ({ page }) => {
  await page.goto("http://localhost:3001/try")
  
  // Wait for the page to load
  await page.waitForLoadState("networkidle")
  
  // Find the undo and redo buttons by aria-label
  const undoButton = page.locator('button[aria-label="Undo"]')
  const redoButton = page.locator('button[aria-label="Redo"]')
  
  // Check initial state (should be disabled)
  await expect(undoButton).toBeDisabled()
  await expect(redoButton).toBeDisabled()
  
  console.log("Initial state - Undo disabled:", await undoButton.isDisabled())
  console.log("Initial state - Redo disabled:", await redoButton.isDisabled())
  
  // Click "Add Row" button to add a component
  const addRowButton = page.locator('button:has-text("Add Row")')
  await addRowButton.click()
  
  // Wait a bit for the state to update
  await page.waitForTimeout(500)
  
  // Check if undo is now enabled
  console.log("After Add Row - Undo disabled:", await undoButton.isDisabled())
  console.log("After Add Row - Redo disabled:", await redoButton.isDisabled())
  
  // Click "Add Row" again
  await addRowButton.click()
  await page.waitForTimeout(500)
  
  console.log("After second Add Row - Undo disabled:", await undoButton.isDisabled())
  console.log("After second Add Row - Redo disabled:", await redoButton.isDisabled())
  
  // Click undo button
  await undoButton.click()
  await page.waitForTimeout(500)
  
  console.log("After Undo - Undo disabled:", await undoButton.isDisabled())
  console.log("After Undo - Redo disabled:", await redoButton.isDisabled())
})
