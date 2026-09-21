import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PreviewRenderer } from "@/features/design-components"
import { appReducer, initialState } from "@/features/app-state/commands/reducer"
import type { AppNode, AppState } from "@/features/app-state"
import { createApplyTemplateActions, getPageTemplateById, pageTemplateDefinitionSchema, pageTemplateRegistry, cloneTemplatePages, TemplateCatalogPopover } from "@/features/templates"

describe("page template registry", () => {
  it("validates the bundled CV template definition", () => {
    expect(pageTemplateRegistry).toHaveLength(3)
    for (const template of pageTemplateRegistry) {
      expect(() => pageTemplateDefinitionSchema.parse(template)).not.toThrow()
    }
  })

  it("renders the bundled CV template through the existing preview renderer", () => {
    const template = getPageTemplateById("cv-resume-personal-website")
    expect(template).toBeDefined()

    const pages = cloneTemplatePages(template!)
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <PreviewRenderer
          component={pages[0]}
          pageBuilderMode="preview"
          selectedComponentId=""
          selectedComponentAncestors={[]}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByText("Avery Johnson")).toBeInTheDocument()
    expect(screen.getByText("Experience")).toBeInTheDocument()
    expect(screen.getByText("NN/g UX Certification")).toBeInTheDocument()
  })

  it("renders a readable template catalog summary with an apply action", async () => {
    const user = userEvent.setup()
    const onApplyTemplate = jest.fn()
    render(
      <TemplateCatalogPopover
        templates={pageTemplateRegistry}
        onApplyTemplate={onApplyTemplate}
      />,
    )

    const trigger = screen.getByRole("button", { name: /templates/i })
    await user.click(trigger)

    expect(await screen.findByText("Template catalog")).toBeInTheDocument()
    expect(screen.getAllByText("Best for resume")).toHaveLength(3)
    expect(screen.getByRole("dialog")).toHaveClass("max-h-[min(80vh,48rem)]", "overflow-hidden")
    expect(screen.getByRole("region", { name: "Available templates" })).toHaveClass("overflow-y-auto", "overflow-x-hidden")

    const applyButton = screen.getByRole("button", { name: /apply personal cv \/ resume template/i })
    await user.click(applyButton)
    expect(onApplyTemplate).toHaveBeenCalledWith("cv-resume-personal-website")
    expect(screen.queryByText("Template catalog")).not.toBeInTheDocument()
  })

  it("renders semantic links and same-page navigation in the engineer CV", () => {
    const template = getPageTemplateById("cv-resume-engineer-dark")
    expect(template).toBeDefined()
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <PreviewRenderer
          component={cloneTemplatePages(template!)[0]}
          pageBuilderMode="preview"
          selectedComponentId=""
          selectedComponentAncestors={[]}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "#experience")
    expect(screen.getByRole("link", { name: "jordan@example.com" })).toHaveAttribute("href", "mailto:jordan@example.com")
    expect(document.getElementById("experience")).toBeInTheDocument()
  })

  it("adds opener protection only to links targeting a new tab", () => {
    const queryClient = new QueryClient()
    const link = {
      tag: "link",
      attributes: { id: "external-link", href: "https://example.com", target: "_blank" },
      children: ["External"],
    } as const

    render(
      <QueryClientProvider client={queryClient}>
        <PreviewRenderer
          component={link}
          pageBuilderMode="preview"
          selectedComponentId=""
          selectedComponentAncestors={[]}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("opens modal-target links in an accessible dialog", async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()
    const link = {
      tag: "link",
      attributes: { id: "modal-link", href: "https://example.com/details", target: "modal" },
      children: ["Details"],
    } as const

    render(
      <QueryClientProvider client={queryClient}>
        <PreviewRenderer
          component={link}
          pageBuilderMode="preview"
          selectedComponentId=""
          selectedComponentAncestors={[]}
        />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole("link", { name: "Details" }))
    expect(screen.getByRole("dialog", { name: "Details" })).toBeInTheDocument()
    expect(screen.getByTitle("Details")).toHaveAttribute("src", "https://example.com/details")

    await user.click(screen.getByRole("button", { name: "Close dialog" }))
    expect(screen.queryByRole("dialog", { name: "Details" })).not.toBeInTheDocument()
  })

  it("filters templates by metadata", async () => {
    const user = userEvent.setup()
    render(<TemplateCatalogPopover templates={pageTemplateRegistry} onApplyTemplate={jest.fn()} />)

    await user.click(screen.getByRole("button", { name: /templates/i }))
    const search = screen.getByRole("textbox", { name: /search templates/i })
    await user.type(search, "dark")

    expect(screen.getByRole("button", { name: /apply engineer cv \/ dark template/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /apply engineer cv \/ light template/i })).not.toBeInTheDocument()
  })

  it("applies the template using existing page actions and can restore the previous page from history", () => {
    const template = getPageTemplateById("cv-resume-personal-website")
    expect(template).toBeDefined()

    const existingPageState: ReadonlyArray<AppNode> = [
      {
        tag: "page",
        attributes: { id: "page-1", title: "Before Template" },
        children: [
          {
            tag: "header1",
            attributes: { id: "header-1" },
            children: ["Before Template"],
          },
        ],
      },
    ]

    let state: AppState = {
      ...initialState,
      componentTree: existingPageState,
      activePage: "page-1",
      history: [
        {
          id: "history-1",
          action: "Page created",
          timestamp: new Date("2026-01-01T00:00:00.000Z"),
          pageState: existingPageState,
        },
      ],
      currentHistoryIndex: 0,
    }

    for (const action of createApplyTemplateActions(template!)) {
      state = appReducer(state, action)
    }

    expect(state.componentTree[0].attributes.id).toBe("cv-template-page")
    expect(state.history).toHaveLength(2)
    expect(state.history[1].action).toBe("Applied template: Personal CV / Resume")

    const restoredState = appReducer(state, {
      type: "RESTORE_FROM_HISTORY",
      payload: { historyIndex: 0 },
    })

    expect(restoredState.componentTree).toEqual(existingPageState)
  })
})
