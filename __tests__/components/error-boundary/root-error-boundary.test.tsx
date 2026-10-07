import React from "react"
import { render, screen } from "@testing-library/react"
import { RootErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error")
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

  it("renders fallback when error thrown", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <RootErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RootErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    // In development mode, error details are in a details/pre element
    expect(screen.getByText("Test error")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reload application/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders custom fallback when provided", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <RootErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </RootErrorBoundary>,
    )

    expect(screen.getByText("Custom fallback")).toBeInTheDocument()
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})