import React, { useState } from "react"
import { render, screen } from "@testing-library/react"
import { DataSourceErrorBoundary } from "@/client/components/error-boundary"

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test data source error")
  }
  return <div>Child content</div>
}

function ThrowErrorControlled({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test data source error")
  }
  return <div data-testid="child-content">Child content</div>
}

describe("DataSourceErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <DataSourceErrorBoundary dataSourceId="rest-api">
        <ThrowError shouldThrow={false} />
      </DataSourceErrorBoundary>,
    )
    expect(screen.getByText("Child content")).toBeInTheDocument()
    expect(screen.queryByText("Data Source Error")).not.toBeInTheDocument()
  })

  it("renders fallback when error thrown", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary dataSourceId="rest-api">
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Data Source Error")).toBeInTheDocument()
    expect(screen.getByText(/Failed to load data from the data source/i)).toBeInTheDocument()
    expect(screen.getByText("Data source: rest-api")).toBeInTheDocument()
    expect(screen.getByText("Test data source error")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("renders custom fallback when provided", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Custom fallback")).toBeInTheDocument()
    expect(screen.queryByText("Data Source Error")).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it("displays data source ID in fallback", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary dataSourceId="generated-data">
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Data source: generated-data")).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it("shows error details in fallback", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <DataSourceErrorBoundary dataSourceId="rest-api">
        <ThrowError shouldThrow={true} />
      </DataSourceErrorBoundary>,
    )

    expect(screen.getByText("Error details")).toBeInTheDocument()
    expect(screen.getByText("Test data source error")).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})