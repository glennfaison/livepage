import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import TemplatePreviewPage from "@/app/preview/[templateId]/page"

jest.mock("next/link", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react")
  return {
    __esModule: true,
    default: ({ children, href }: Readonly<{ children: React.ReactNode; href: string }>) =>
      ReactModule.createElement("a", { href }, children),
  }
})

const PAGE_STORAGE_KEY = "livepage-page-storage"
const TEMPLATE_ID = "cv-resume-personal-website"

async function renderPreviewPage(templateId: string) {
  const queryClient = new QueryClient()
  let utils!: ReturnType<typeof render>
  await act(async () => {
    utils = render(
      <QueryClientProvider client={queryClient}>
        <TemplatePreviewPage params={Promise.resolve({ templateId })} />
      </QueryClientProvider>,
    )
  })
  return utils
}

describe("TemplatePreviewPage", () => {
  const originalOpen = window.open

  beforeEach(() => {
    window.open = jest.fn()
    window.localStorage.clear()
  })

  afterEach(() => {
    window.open = originalOpen
  })

  it("renders the requested template in preview mode", async () => {
    await renderPreviewPage(TEMPLATE_ID)

    expect(await screen.findByText(/preview:/i)).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "Header 1: Avery Johnson" })).toBeInTheDocument()
  })

  it("never overwrites the persisted page while previewing", async () => {
    const persistedState = JSON.stringify({
      version: 1,
      componentTree: [{ tag: "page", attributes: { id: "saved-page", title: "Saved work" }, children: [] }],
      activePage: "saved-page",
      pageBuilderMode: "edit",
      toolbarMinimized: false,
    })
    window.localStorage.setItem(PAGE_STORAGE_KEY, persistedState)

    await renderPreviewPage(TEMPLATE_ID)

    expect(screen.queryByText(/saved work/i)).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "Header 1: Avery Johnson" })).toBeInTheDocument()
    expect(window.localStorage.getItem(PAGE_STORAGE_KEY)).toBe(persistedState)
  })

  it("applies the template in the builder from the Apply link without touching saved work", async () => {
    const persistedState = JSON.stringify({
      version: 1,
      componentTree: [{ tag: "page", attributes: { id: "saved-page", title: "Saved work" }, children: [] }],
      activePage: "saved-page",
      pageBuilderMode: "edit",
      toolbarMinimized: false,
    })
    window.localStorage.setItem(PAGE_STORAGE_KEY, persistedState)

    await renderPreviewPage(TEMPLATE_ID)

    const applyLink = await screen.findByRole("link", { name: /apply template/i })
    expect(applyLink).toHaveAttribute("href", `/try?template=${TEMPLATE_ID}&mode=edit`)
    expect(window.localStorage.getItem(PAGE_STORAGE_KEY)).toBe(persistedState)
  })

  it("opens the template in a new builder tab from the Open in Builder button", async () => {
    const user = userEvent.setup()
    await renderPreviewPage(TEMPLATE_ID)

    await user.click(await screen.findByRole("button", { name: /open in builder/i }))

    expect(window.open).toHaveBeenCalledWith(`/try?template=${TEMPLATE_ID}&mode=edit`, "_blank")
  })

  it("shows a not-found state for an unknown template id", async () => {
    await renderPreviewPage("template-does-not-exist")

    expect(await screen.findByText(/template not found/i)).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /apply template/i })).not.toBeInTheDocument()
  })
})
