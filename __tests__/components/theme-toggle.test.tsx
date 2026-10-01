"use client"

import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeToggle } from "@/client/components/theme-toggle"

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}))

import { useTheme } from "next-themes"

const mockSetTheme = jest.fn()

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders a toggle button with an accessible label", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme: mockSetTheme,
    })
    render(<ThemeToggle />)
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument()
  })

  it("renders an icon inside the toggle button", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme: mockSetTheme,
    })
    render(<ThemeToggle />)
    const button = screen.getByRole("button", { name: "Toggle theme" })
    expect(button.querySelector("svg")).not.toBeNull()
  })

  it("toggles to dark mode when clicked in light mode", async () => {
    const user = userEvent.setup()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme: mockSetTheme,
    })
    render(<ThemeToggle />)
    await user.click(screen.getByRole("button", { name: "Toggle theme" }))
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("toggles to light mode when clicked in dark mode", async () => {
    const user = userEvent.setup()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: mockSetTheme,
    })
    render(<ThemeToggle />)
    await user.click(screen.getByRole("button", { name: "Toggle theme" }))
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("renders different icons for light and dark modes", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: "light",
      setTheme: mockSetTheme,
    })
    const { container: lightContainer } = render(<ThemeToggle />)

    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: "dark",
      setTheme: mockSetTheme,
    })
    const { container: darkContainer } = render(<ThemeToggle />)

    const lightSvg = lightContainer.querySelector("svg")?.outerHTML
    const darkSvg = darkContainer.querySelector("svg")?.outerHTML

    expect(lightSvg).not.toBe(darkSvg)
  })
})
