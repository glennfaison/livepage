"use client"

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { metadata } from "@/app/layout"

describe("Favicon assets and metadata", () => {
  const appDir = join(process.cwd(), "app")

  it("declares favicon icons in root layout metadata", () => {
    expect(metadata.icons).toBeDefined()
    expect(metadata.icons?.icon).toBeDefined()
    const icons = metadata.icons?.icon as Array<{ url: string; media?: string; type?: string }>
    expect(Array.isArray(icons)).toBe(true)
    expect(icons.length).toBeGreaterThanOrEqual(3)

    const lightIcon = icons.find((i) => i.url === "/favicon-light.svg")
    const darkIcon = icons.find((i) => i.url === "/favicon-dark.svg")
    const icoIcon = icons.find((i) => i.url === "/favicon.ico")

    expect(lightIcon).toBeDefined()
    expect(lightIcon?.media).toBe("(prefers-color-scheme: light)")
    expect(lightIcon?.type).toBe("image/svg+xml")

    expect(darkIcon).toBeDefined()
    expect(darkIcon?.media).toBe("(prefers-color-scheme: dark)")
    expect(darkIcon?.type).toBe("image/svg+xml")

    expect(icoIcon).toBeDefined()
    expect(icoIcon?.type).toBe("image/x-icon")
    expect(icoIcon?.sizes).toContain("16x16")
    expect(icoIcon?.sizes).toContain("32x32")
    expect(icoIcon?.sizes).toContain("48x48")
    expect(icoIcon?.sizes).toContain("256x256")
  })

  it("has light favicon SVG asset on disk", () => {
    const lightPath = join(appDir, "favicon-light.svg")
    expect(existsSync(lightPath)).toBe(true)
    const content = readFileSync(lightPath, "utf-8")
    expect(content).toContain("<svg")
    expect(content).toContain("#333333")
  })

  it("has dark favicon SVG asset on disk", () => {
    const darkPath = join(appDir, "favicon-dark.svg")
    expect(existsSync(darkPath)).toBe(true)
    const content = readFileSync(darkPath, "utf-8")
    expect(content).toContain("<svg")
    expect(content).toContain("#EBEBEB")
  })

  it("has ico favicon asset on disk", () => {
    const icoPath = join(appDir, "favicon.ico")
    expect(existsSync(icoPath)).toBe(true)
    const stats = require("fs").statSync(icoPath)
    expect(stats.size).toBeGreaterThan(1000)
  })

  it("light and dark SVGs use the same mark (Layers3 paths)", () => {
    const lightPath = join(appDir, "favicon-light.svg")
    const darkPath = join(appDir, "favicon-dark.svg")
    const lightContent = readFileSync(lightPath, "utf-8")
    const darkContent = readFileSync(darkPath, "utf-8")

    const lightPaths = lightContent.match(/d="[^"]+"/g) || []
    const darkPaths = darkContent.match(/d="[^"]+"/g) || []

    expect(lightPaths.length).toBe(3)
    expect(darkPaths.length).toBe(3)
    expect(lightPaths).toEqual(darkPaths)
  })

  it("SVG favicon is legible at 16px (has adequate stroke width)", () => {
    const lightPath = join(appDir, "favicon-light.svg")
    const content = readFileSync(lightPath, "utf-8")
    expect(content).toContain('stroke-width="1.5"')
  })
})