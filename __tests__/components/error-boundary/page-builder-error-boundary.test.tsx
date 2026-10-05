import React from "react"
import { render, screen } from "@testing-library/react"
import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error")
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

  it("renders fallback when error thrown", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    
    render(
      <PageBuilderErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PageBuilderErrorBoundary>,
    )
    
    expect(screen.getByText("Couldn't build this page")).toBeInTheDocument()
    expect(screen.getByText("Test error")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })
})