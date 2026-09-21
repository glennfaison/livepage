import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PreviewRenderer } from "@/features/design-components"
import { appReducer, initialState } from "@/features/app-state/commands/reducer"
import { createApplyTemplateActions, getPageTemplateById, pageTemplateDefinitionSchema, pageTemplateRegistry, cloneTemplatePages } from "@/features/templates"

describe("page template registry", () => {
  it("validates the bundled CV template definition", () => {
    expect(pageTemplateRegistry).toHaveLength(1)
    expect(() => pageTemplateDefinitionSchema.parse(pageTemplateRegistry[0])).not.toThrow()
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

  it("applies the template using existing page actions and can restore the previous page from history", () => {
    const template = getPageTemplateById("cv-resume-personal-website")
    expect(template).toBeDefined()

    const existingPageState = [
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
    ] as const

    let state = {
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
