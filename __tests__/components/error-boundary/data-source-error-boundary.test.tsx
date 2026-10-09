import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataSourceErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow, errorMessage }: { shouldThrow: boolean; errorMessage?: string }) {
  if (shouldThrow) {
    throw new Error(errorMessage ?? "Test data source error")
  }
  return <div>Child content</div>
}

describe("DataSourceErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <DataSourceErrorBoundary>
        <ThrowError shouldThrow={false} />
      </DataSourceErrorBoundary>,
    )
    expect(screen.getByText("Child content")).toBeInTheDocument()
    expect(screen.queryByText("Data Source Unavailable")).not.toBeInTheDocument()
  })

  it("renders preview mode fallback when error thrown in preview mode", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary isPreviewMode={true}>
        <ThrowError shouldThrow={true} errorMessage="Test data source error" />
      </DataSourceErrorBoundary>,
    )

    // Unknown category error gets generic title in preview mode
    expect(screen.getByText("Unknown Error")).toBeInTheDocument()
    expect(screen.getByText("An unexpected error occurred. Please try again or contact support if the problem persists.")).toBeInTheDocument()
    
    // Expand error details to see the error message
    await userEvent.click(screen.getByText("Error details"))
    expect(screen.getByText((content, element) => 
      element.tagName === "PRE" && content.includes("Test data source error")
    )).toBeInTheDocument()
    
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders edit mode fallback when error thrown in edit mode", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary isPreviewMode={false}>
        <ThrowError shouldThrow={true} errorMessage="Test data source error" />
      </DataSourceErrorBoundary>,
    )

    // Unknown category error gets generic title in edit mode
    expect(screen.getByText("Unknown Error")).toBeInTheDocument()
    expect(screen.getByText("An unexpected error occurred. Please try again or contact support if the problem persists.")).toBeInTheDocument()
    
    // Expand error details to see the error message
    await userEvent.click(screen.getByText("Error details"))
    expect(screen.getByText((content, element) => 
      element.tagName === "PRE" && content.includes("Test data source error")
    )).toBeInTheDocument()
    
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders network error with user-friendly message in preview mode", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary isPreviewMode={true}>
        <ThrowError shouldThrow={true} errorMessage="Network error: failed to fetch" />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Network Error")).toBeInTheDocument()
    expect(screen.getByText("Unable to connect to the server. Please check your internet connection and try again.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders CORS error with user-friendly message", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary isPreviewMode={false}>
        <ThrowError shouldThrow={true} errorMessage="CORS error: blocked by CORS policy" />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Cors Error")).toBeInTheDocument()
    expect(screen.getByText("The server blocked this request due to security policy. This usually means the data source doesn't allow requests from this domain.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /report issue/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders custom fallback when provided", () => {
    render(
      <DataSourceErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Custom fallback")).toBeInTheDocument()
    expect(screen.queryByText("Unknown Error")).not.toBeInTheDocument()
  })
})