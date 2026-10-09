import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TemplateCatalog, describeTemplateDisplayCatalog } from "@/client/features/templates"

const templates = describeTemplateDisplayCatalog()
const categories = Array.from(new Set(templates.map((template) => template.category)))

describe("TemplateCatalog", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("scrolls categories horizontally and templates vertically, each in its own container", () => {
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    expect(screen.getByRole("tablist", { name: "Template categories" })).toHaveClass("overflow-x-auto")
    expect(screen.getByRole("region", { name: "Available templates" })).toHaveClass("overflow-y-auto", "overflow-x-hidden", "min-h-0", "flex-1")
  })

  it("keeps every category tab at its natural width so the tab list overflows instead of squashing", () => {
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    const tabs = within(screen.getByRole("tablist", { name: "Template categories" })).getAllByRole("tab")
    expect(tabs.map((tab) => tab.textContent)).toEqual(["All", ...categories.slice().sort()])
    for (const tab of tabs) expect(tab).toHaveClass("shrink-0")
  })

  it("filters by category", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    const category = categories[0]
    await user.click(screen.getByRole("tab", { name: category }))

    const expected = templates.filter((template) => template.category === category)
    for (const template of templates) {
      const button = screen.queryByRole("button", { name: `Apply ${template.name} template` })
      if (template.category === category) expect(button).toBeInTheDocument()
      else expect(button).not.toBeInTheDocument()
    }
    expect(expected.length).toBeGreaterThan(0)
  })

  it("shows an empty state when the search matches nothing", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    await user.type(screen.getByRole("textbox", { name: "Search templates" }), "zzzz-no-such-template")
    expect(screen.getByText("No templates match your search.")).toBeInTheDocument()
  })

  it("does not nest interactive controls inside the apply control", () => {
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    for (const button of screen.getAllByRole("button")) {
      expect(button.querySelector("button, a, [role='button']")).toBeNull()
    }
  })

  it("favorites a template, lists it under Favorites, and falls back to All when the last favorite is removed", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    expect(screen.queryByRole("tab", { name: "Favorites" })).not.toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Add to favorites" })[0])
    await user.click(screen.getByRole("tab", { name: "Favorites" }))

    expect(screen.getAllByRole("button", { name: /^Apply .* template$/ })).toHaveLength(1)
    expect(JSON.parse(window.localStorage.getItem("livepage-favorite-templates") ?? "[]")).toHaveLength(1)

    await user.click(screen.getByRole("button", { name: "Remove from favorites" }))

    expect(screen.queryByRole("tab", { name: "Favorites" })).not.toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getAllByRole("button", { name: /^Apply .* template$/ })).toHaveLength(templates.length)
  })

  it("records applied templates under Recently used, most recent first", async () => {
    const user = userEvent.setup()
    const onApplyTemplate = jest.fn()
    const onClose = jest.fn()
    const { unmount } = render(<TemplateCatalog templates={templates} onApplyTemplate={onApplyTemplate} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: `Apply ${templates[0].name} template` }))
    await user.click(screen.getByRole("button", { name: `Apply ${templates[1].name} template` }))

    expect(onApplyTemplate).toHaveBeenNthCalledWith(1, templates[0].id)
    expect(onApplyTemplate).toHaveBeenNthCalledWith(2, templates[1].id)
    expect(onClose).toHaveBeenCalledTimes(2)
    unmount()

    render(<TemplateCatalog templates={templates} onApplyTemplate={onApplyTemplate} />)
    await user.click(screen.getByRole("tab", { name: "Recently used" }))

    const names = screen.getAllByRole("button", { name: /^Apply .* template$/ }).map((button) => button.getAttribute("aria-label"))
    expect(names).toEqual([`Apply ${templates[1].name} template`, `Apply ${templates[0].name} template`])
  })

  it("switches between grid and list layouts", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "List view" }))
    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "false")
  })

  it("ignores corrupted stored data", () => {
    window.localStorage.setItem("livepage-favorite-templates", "{not json")
    window.localStorage.setItem("livepage-recently-used-templates", JSON.stringify({ not: "a list" }))

    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    expect(screen.queryByRole("tab", { name: "Favorites" })).not.toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "Recently used" })).not.toBeInTheDocument()
  })

  it("persists view mode preference across remounts", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "List view" }))
    expect(window.localStorage.getItem("livepage-template-view-mode")).toBe("list")
    unmount()

    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)
    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true")
  })

  it("shows a template count and a clear search button when the search is active", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    expect(screen.getAllByText(`${templates.length} templates`)).toHaveLength(2)
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()

    const search = screen.getByRole("textbox", { name: "Search templates" })
    await user.type(search, "resume")
    const visibleCount = screen.getAllByText(/\d templates/)[0].textContent
    expect(visibleCount).not.toBe(`${templates.length} templates`)
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument()
  })

  it("clears the search when the clear button is clicked", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    await user.type(screen.getByRole("textbox", { name: "Search templates" }), "zzzz-no-such-template")
    await user.click(screen.getByRole("button", { name: "Clear search" }))

    expect(screen.getByRole("textbox", { name: "Search templates" })).toHaveValue("")
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()
  })

  it("suggests clearing the search in the empty state", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalog templates={templates} onApplyTemplate={jest.fn()} />)

    await user.type(screen.getByRole("textbox", { name: "Search templates" }), "zzzz-no-such-template")
    expect(screen.getByText("Clear your search")).toBeInTheDocument()
  })

  it("previews a template in a modal without applying it", async () => {
    const user = userEvent.setup()
    const onApplyTemplate = jest.fn()
    render(<TemplateCatalog templates={templates} onApplyTemplate={onApplyTemplate} />)

    await user.click(screen.getByRole("button", { name: `Preview ${templates[0].name} template` }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText(templates[0].name)).toBeInTheDocument()
    expect(within(dialog).getByText(templates[0].category)).toBeInTheDocument()
    expect(onApplyTemplate).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Close preview" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("applies a template from the preview modal", async () => {
    const user = userEvent.setup()
    const onApplyTemplate = jest.fn()
    const onClose = jest.fn()
    render(<TemplateCatalog templates={templates} onApplyTemplate={onApplyTemplate} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: `Preview ${templates[0].name} template` }))
    await user.click(await screen.findByRole("button", { name: "Apply Template" }))

    expect(onApplyTemplate).toHaveBeenCalledWith(templates[0].id)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders custom template items when renderTemplateItem is provided", async () => {
    const user = userEvent.setup()
    const renderTemplateItem = jest.fn(() => <div data-testid="custom-item">Custom</div>)
    render(<TemplateCatalog templates={templates.slice(0, 2)} onApplyTemplate={jest.fn()} renderTemplateItem={renderTemplateItem} />)

    expect(screen.getAllByTestId("custom-item")).toHaveLength(2)
    expect(renderTemplateItem).toHaveBeenCalledTimes(2)
  })
})
