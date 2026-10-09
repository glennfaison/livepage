import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow, errorMessage }: { shouldThrow: boolean; errorMessage?: string }) {
  if (shouldThrow) {
    throw new Error(errorMessage ?? "Test error")
  }
  return <div>Child content</div>
}

describe("PageBuilderErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <PageBuilderErrorBoundary>
        <ThrowError shouldThrow={false} />
      </PageBuilderErrorBoundary>,
    )
    expect(screen.getByText("Child content")).toBeInTheDocument()
    expect(screen.queryByText("Couldn't build this page")).not.toBeInTheDocument()
  })

  it("renders fallback when error thrown", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <PageBuilderErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </PageBuilderErrorBoundary>,
    )

    // Unknown category error gets generic message
    expect(screen.getByText("Unknown Error")).toBeInTheDocument()
    expect(screen.getByText("An unexpected error occurred. Please try again or contact support if the problem persists.")).toBeInTheDocument()
    
    // Expand error details to see the error message
    await userEvent.click(screen.getByText("Error details"))
    expect(screen.getByText((content, element) => 
      element.tagName === "PRE" && content.includes("Test error")
    )).toBeInTheDocument()
    
    // Unknown category has "Try Again" button (retry action)
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders render error with component reset option", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const onResetComponent = jest.fn()

    render(
      <PageBuilderErrorBoundary onResetComponent={onResetComponent}>
        <ThrowError shouldThrow={true} errorMessage="Render error: component failed to render" />
      </PageBuilderErrorBoundary>,
    )

    expect(screen.getByText("Render Error")).toBeInTheDocument()
    expect(screen.getByText("A component failed to render correctly. This is usually a temporary issue.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reset component/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /report issue/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})