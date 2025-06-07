// import { render, screen } from "@/__tests__/utils/test-utils"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as Header1 from "@/features/design-components/header1"
import "@testing-library/jest-dom"
import { withTextEditing } from "@/features/design-components/hoc/content-editable-hoc"

describe("Header1 Component", () => {
  const mockProps = {
    componentId: "header1-test",
    attributes: { content: "Test Header" },
    pageBuilderMode: "edit" as const,
    setSelectedComponent: jest.fn(),
    updateComponent: jest.fn(),
    removeComponent: jest.fn(),
    addComponent: jest.fn(),
    duplicateComponent: jest.fn(),
    replaceComponent: jest.fn(),
  }

  it("renders with the correct content", () => {
    render(<Header1.Component {...mockProps} />)

    const header = screen.getByText("Test Header")
    expect(header).toBeInTheDocument()
    expect(header.tagName).toBe("H1")
    expect(header).toHaveClass("text-4xl font-bold py-2")
  })

  it("is editable in edit mode", async () => {
    const Component = withTextEditing(Header1.Component)
    render(<Component {...mockProps} />)

    const header = screen.getByText("Test Header")
    await userEvent.dblClick(header)
    expect(header).toHaveAttribute("contentEditable", "true")
  })

  it("is not editable in preview mode", async () => {
    const _mockProps = { ...mockProps, pageBuilderMode: "preview" as const }
    const Component = withTextEditing(Header1.Component)
    render(<Component {..._mockProps} />)

    const header = screen.getByText("Test Header")
    await userEvent.dblClick(header)
    expect(header).not.toHaveAttribute("contentEditable", "true")
  })

  it("calls updateComponent when content is edited", async () => {
    const Component = withTextEditing(Header1.Component)
    render(<Component {...mockProps} />)

    const header = screen.getByText("Test Header")

    // Simulate editing the content
    await userEvent.dblClick(header)
    await userEvent.clear(header)
    await userEvent.type(header, "Updated Header")

    // Simulate blur event to trigger update
    header.blur()

    expect(mockProps.updateComponent).toHaveBeenCalledWith("header1-test", { content: "Updated Header" })
  })

  it("calls setSelectedComponent when clicked in edit mode", async () => {
    render(<Header1.Component {...mockProps} />)

    const header = screen.getByText("Test Header")
    await userEvent.click(header)

    expect(mockProps.setSelectedComponent).toHaveBeenCalledWith("header1-test")
  })

  it("does not call setSelectedComponent when clicked in preview mode", async () => {
    const _mockProps = { ...mockProps, setSelectedComponent: jest.fn(), pageBuilderMode: "preview" as const }
    render(<Header1.Component {..._mockProps} />)

    const header = screen.getByText("Test Header")
    await userEvent.click(header)

    expect(_mockProps.setSelectedComponent).not.toHaveBeenCalled()
  })

  it("has the correct default attributes", () => {
    expect(Header1.defaultAttributes).toEqual({
      content: "Header 1",
    })
  })

  it("has the correct tag and label", () => {
    expect(Header1.tag).toBe("header1")
    expect(Header1.label).toBe("Header 1")
  })

  it("has appropriate keywords for search", () => {
    expect(Header1.keywords).toContain("h1")
    expect(Header1.keywords).toContain("title")
    expect(Header1.keywords).toContain("header")
  })

  it("has the correct settings fields", () => {
    expect(Header1.settingsFields).toHaveProperty("content")
    expect(Header1.settingsFields.content).toHaveProperty("type", "text")
    expect(Header1.settingsFields.content).toHaveProperty("label", "Content")
  })
})
