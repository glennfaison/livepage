import React from "react"
import { render, screen } from "@testing-library/react"
import { DataSourceErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test data source error")
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

  it("renders preview mode fallback when error thrown in preview mode", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary isPreviewMode={true}>
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Data Source Unavailable")).toBeInTheDocument()
    expect(screen.getByText("The data source failed to load. This content cannot be displayed in preview mode.")).toBeInTheDocument()
    expect(screen.getByText("Test data source error")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry loading data/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders edit mode fallback when error thrown in edit mode", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary isPreviewMode={false}>
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Couldn't Load Data")).toBeInTheDocument()
    expect(screen.getByText("Something went wrong while loading data. The error has been logged to the console.")).toBeInTheDocument()
    expect(screen.getByText("Test data source error")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders custom fallback when provided", () => {
    render(
      <DataSourceErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Custom fallback")).toBeInTheDocument()
    expect(screen.queryByText("Data Source Unavailable")).not.toBeInTheDocument()
  })
})