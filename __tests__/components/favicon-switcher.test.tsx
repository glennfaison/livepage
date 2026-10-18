"use client"

import React from "react"
import { render, screen, act } from "@testing-library/react"
import { FaviconSwitcher } from "@/client/components/favicon-switcher"

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}))

import { useTheme } from "next-themes"

describe("FaviconSwitcher", () => {
  const originalDocumentQuerySelector = document.querySelector.bind(document)

  beforeEach(() => {
    jest.clearAllMocks()
    // Create mock link elements
    const lightLink = document.createElement("link")
    lightLink.rel = "icon"
    lightLink.media = "(prefers-color-scheme: light)"
    lightLink.href = "/favicon-light.svg"
    lightLink.disabled = false

    const darkLink = document.createElement("link")
    darkLink.rel = "icon"
    darkLink.media = "(prefers-color-scheme: dark)"
    darkLink.href = "/favicon-dark.svg"
    darkLink.disabled = true

    const icoLink = document.createElement("link")
    icoLink.rel = "icon"
    icoLink.href = "/favicon.ico"
    icoLink.disabled = true

    document.head.appendChild(lightLink)
    document.head.appendChild(darkLink)
    document.head.appendChild(icoLink)
  })

  afterEach(() => {
    document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove())
  })

  it("enables dark icon and disables light icon when theme is dark", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: "dark",
    })

    render(<FaviconSwitcher />)

    const lightLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="light"]')
    const darkLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="dark"]')
    const icoLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]:not([media])')

    expect(lightLink?.disabled).toBe(true)
    expect(darkLink?.disabled).toBe(false)
    expect(icoLink?.disabled).toBe(true)
  })

  it("enables light icon and disables dark icon when theme is light", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: "light",
    })

    render(<FaviconSwitcher />)

    const lightLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="light"]')
    const darkLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="dark"]')
    const icoLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]:not([media])')

    expect(lightLink?.disabled).toBe(false)
    expect(darkLink?.disabled).toBe(true)
    expect(icoLink?.disabled).toBe(true)
  })

  it("does nothing when resolvedTheme is not yet available", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: undefined,
    })

    const lightLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="light"]')
    const darkLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="dark"]')
    const initialLightDisabled = lightLink?.disabled
    const initialDarkDisabled = darkLink?.disabled

    render(<FaviconSwitcher />)

    expect(lightLink?.disabled).toBe(initialLightDisabled)
    expect(darkLink?.disabled).toBe(initialDarkDisabled)
  })

  it("updates when resolvedTheme changes", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: "light",
    })

    const { rerender } = render(<FaviconSwitcher />)

    let lightLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="light"]')
    let darkLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="dark"]')
    expect(lightLink?.disabled).toBe(false)
    expect(darkLink?.disabled).toBe(true)

    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: "dark",
    })

    rerender(<FaviconSwitcher />)

    lightLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="light"]')
    darkLink = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="dark"]')
    expect(lightLink?.disabled).toBe(true)
    expect(darkLink?.disabled).toBe(false)
  })
})