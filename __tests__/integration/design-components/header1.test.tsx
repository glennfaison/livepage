import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { getComponentInfo } from "@/features/design-components"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@testing-library/jest-dom"

// Mock the component operations context used by connected components
jest.mock("@/lib/component-operations-context", () => ({
  useComponentOperationsContext: () => ({
    setSelectedComponent: jest.fn(),
    updateComponent: jest.fn(),
    removeComponent: jest.fn(),
    addComponent: jest.fn(),
    duplicateComponent: jest.fn(),
    replaceComponent: jest.fn(),
  }),
}))

describe("Header1 Component (metadata-based)", () => {
  const Header1 = getComponentInfo("header1")
  const mockComponent = {
    tag: "header1",
    attributes: { id: "header1-test" },
    children: ["Test Header"],
  } as any

  const editProps = {
    pageBuilderMode: "edit" as const,
    component: mockComponent,
    selectedComponentId: "",
    selectedComponentAncestors: [],
  }

  const previewProps = {
    ...editProps,
    pageBuilderMode: "preview" as const,
  }

  it("renders with the correct content", () => {
    const Component = Header1.ViewModeComponent
    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <Component {...previewProps} />
      </QueryClientProvider>
    )

    const header = screen.getByText("Test Header")
    expect(header).toBeInTheDocument()
    expect(header.tagName).toBe("H1")
    expect(header).toHaveClass("text-4xl font-bold py-2")
  })

  it("is editable in edit mode", async () => {
    const Component = Header1.EditModeComponent
    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <Component {...editProps} />
      </QueryClientProvider>
    )

    const header = screen.getByText("Test Header")
    await userEvent.dblClick(header)
    expect(header).toHaveAttribute("contentEditable", "true")
  })

  it("is not editable in preview mode", async () => {
    const Component = Header1.ViewModeComponent
    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <Component {...previewProps} />
      </QueryClientProvider>
    )

    const header = screen.getByText("Test Header")
    await userEvent.dblClick(header)
    expect(header).not.toHaveAttribute("contentEditable", "true")
  })

  it("has the correct default attributes in metadata", () => {
    expect(Header1.defaultAttributes).toBeDefined()
  })

  it("has the correct tag and label in metadata", () => {
    expect(Header1.tag).toBe("header1")
    expect(Header1.label).toBe("Header 1")
  })

  it("has appropriate keywords for search", () => {
    expect(Header1.keywords).toContain("h1")
    expect(Header1.keywords).toContain("title")
    expect(Header1.keywords).toContain("header")
  })

  it("has the correct settings fields in metadata", () => {
    expect(Header1.attributes).toBeDefined()
    const contentField = Header1.attributes.find((f: any) => f.id === "content") as any
    expect(contentField).toBeDefined()
    expect(contentField.type).toBe("text")
    expect(contentField.label).toBe("Content")
  })
})
