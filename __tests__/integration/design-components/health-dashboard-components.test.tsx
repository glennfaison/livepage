import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getComponentInfo } from "@/client/features/design-components"
import type { AppNode } from "@/client/features/app-state"

function renderPreview(tag: "data-table" | "line-chart", attributes: Readonly<Record<string, string>>) {
  const component: AppNode = {
    tag,
    attributes: { id: `${tag}-test`, ...attributes },
    children: [],
  }
  const Component = getComponentInfo(tag).PreviewModeComponent
  const queryClient = new QueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <Component
        pageBuilderMode="preview"
        component={component}
        selectedComponentId=""
        selectedComponentAncestors={[]}
      />
    </QueryClientProvider>,
  )
}

describe("health dashboard design components", () => {
  it("renders data-table rows and safely handles repeated column labels", () => {
    renderPreview("data-table", {
      columns: JSON.stringify(["Status", "Status"]),
      rows: JSON.stringify([["Stable", "Review"]]),
    })

    expect(screen.getAllByRole("columnheader", { name: "Status" })).toHaveLength(2)
    expect(screen.getByText("Stable")).toBeInTheDocument()
    expect(screen.getByText("Review")).toBeInTheDocument()
  })

  it("reports invalid table JSON instead of silently rendering sample data", () => {
    renderPreview("data-table", { columns: "{", rows: "[]" })

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid table columns: Enter valid JSON.")
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })

  it("reports table rows that do not match the column count", () => {
    renderPreview("data-table", {
      columns: JSON.stringify(["Name", "Status"]),
      rows: JSON.stringify([["Patient"]]),
    })

    expect(screen.getByRole("alert")).toHaveTextContent("Each table row must contain one cell for every column.")
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })

  it("reports series lengths that do not match the chart categories", () => {
    renderPreview("line-chart", {
      categories: JSON.stringify(["Jan", "Feb"]),
      "series-a-values": JSON.stringify([1]),
      "series-b-values": JSON.stringify([2, 3]),
    })

    expect(screen.getByRole("alert")).toHaveTextContent("Each data series must contain one value for every x-axis label.")
    expect(screen.queryByRole("img", { name: "Blood Pressure" })).not.toBeInTheDocument()
  })

  it("rejects non-finite chart values and invalid y-axis ranges", () => {
    const { rerender } = renderPreview("line-chart", {
      "series-a-values": "[1e999]",
    })

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid series A values")

    const component: AppNode = {
      tag: "line-chart",
      attributes: {
        id: "line-chart-test",
        "y-min": "10",
        "y-max": "10",
      },
      children: [],
    }
    const Component = getComponentInfo("line-chart").PreviewModeComponent
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <Component
          pageBuilderMode="preview"
          component={component}
          selectedComponentId=""
          selectedComponentAncestors={[]}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("y-axis maximum must be a finite number greater than its minimum.")
  })
})
