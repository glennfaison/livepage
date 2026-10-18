import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RootErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow, errorMessage }: { shouldThrow: boolean; errorMessage?: string }) {
  if (shouldThrow) {
    throw new Error(errorMessage ?? "Test error")
  }
  return <div>Child content</div>
}

describe("RootErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <RootErrorBoundary>
        <ThrowError shouldThrow={false} />
      </RootErrorBoundary>,
    )
    expect(screen.getByText("Child content")).toBeInTheDocument()
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument()
  })

  it("renders fallback when error thrown", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <RootErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </RootErrorBoundary>,
    )

    // Unknown category error gets generic message
    expect(screen.getByText("Unknown Error")).toBeInTheDocument()
    expect(screen.getByText("An unexpected error occurred. Please try again or contact support if the problem persists.")).toBeInTheDocument()
    
    // Expand error details to see the error message
    await userEvent.click(screen.getByText("Error details"))
    expect(screen.getByText((content, element) => 
      element?.tagName === "PRE" && content.includes("Test error")
    )).toBeInTheDocument()
    
    // Unknown category has "Try Again" button (retry action)
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /copy error/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders network error with user-friendly message", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <RootErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Network error: failed to fetch" />
      </RootErrorBoundary>,
    )

    expect(screen.getByText("Network Error")).toBeInTheDocument()
    expect(screen.getByText("Unable to connect to the server. Please check your internet connection and try again.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders custom fallback when provided", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <RootErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </RootErrorBoundary>,
    )

    expect(screen.getByText("Custom fallback")).toBeInTheDocument()
    expect(screen.queryByText("Unknown Error")).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})