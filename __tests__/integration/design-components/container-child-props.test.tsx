import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getComponentInfo } from "@/features/design-components"
import type { AppNode } from "@/features/app-state"

function renderWithQueryClient(ui: React.ReactElement) {
	const queryClient = new QueryClient()

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe("container child props", () => {
	it.each(["row", "column"] as const)("renders %s children without wrapper spans", (tag) => {
		const child: AppNode = {
			tag: "header1",
			attributes: { id: "header-1" },
			children: ["Child Header"],
		}
		const component: AppNode = {
			tag,
			attributes: { id: "row-1" },
			children: [child],
		}
		const Component = getComponentInfo(tag).ViewModeComponent

		const { container } = renderWithQueryClient(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		expect(screen.getByText("Child Header")).toHaveClass("flex-1")
		expect(container.querySelector("span")).toBeNull()
		expect(screen.getByText("Child Header")).toBeInTheDocument()
		if (tag === "row") {
			expect(container.firstElementChild).toHaveClass("flex-nowrap")
		}
	})

	it("applies the child slot class to edit-mode wrappers", () => {
		const component: AppNode = {
			tag: "row",
			attributes: { id: "row-1" },
			children: [
				{
					tag: "header1",
					attributes: { id: "header-1" },
					children: ["Child Header"],
				},
			],
		}

		const Component = getComponentInfo("row").EditModeComponent
		const { container } = renderWithQueryClient(
			<Component
				pageBuilderMode="edit"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		expect(screen.getByText("Child Header").closest("div")).toHaveClass("flex-1", "basis-0", "min-w-0")
		expect(container.querySelector("span")).toBeNull()
	})

	it("lets a paragraph determine the row height through a column", () => {
		const component: AppNode = {
			tag: "row",
			attributes: { id: "row-1" },
			children: [
				{
					tag: "column",
					attributes: { id: "column-1" },
					children: [
						{
							tag: "paragraph",
							attributes: { id: "paragraph-1" },
							children: ["A paragraph that must remain visible below the row's minimum height."],
						},
					],
				},
			],
		}

		const Component = getComponentInfo("row").EditModeComponent
		const { container } = renderWithQueryClient(
			<Component
				pageBuilderMode="edit"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		const paragraph = screen.getByText(/A paragraph that must remain visible/)
		expect(paragraph.closest("span")).not.toHaveClass("min-h-0")
		expect(container.firstElementChild).toContainElement(paragraph)
	})

	it("applies childClassName to the page surface", () => {
		const component: AppNode = {
			tag: "page",
			attributes: { id: "page-1", title: "Page" },
			children: [],
		}
		const Component = getComponentInfo("page").ViewModeComponent

		const { container } = render(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
				childClassName="slot-class"
			/>
		)

		const pageSurface = container.querySelector("section > div")
		expect(pageSurface).toHaveClass("slot-class")
	})
})
