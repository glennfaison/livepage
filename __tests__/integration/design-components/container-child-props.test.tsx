import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getComponentInfo } from "@/client/features/design-components"
import type { AppNode } from "@/client/features/app-state"

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
		const Component = getComponentInfo(tag).PreviewModeComponent

		const { container } = renderWithQueryClient(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		if (tag === "row") {
			expect(screen.getByText("Child Header")).toHaveClass("flex-1")
			expect(container.firstElementChild).toHaveClass("flex-nowrap")
		}
		expect(container.querySelector("span")).toBeNull()
		expect(screen.getByText("Child Header")).toBeInTheDocument()
	})

	it("gives wrapping rows a real basis so flex-wrap can actually break the line", () => {
		// A flex item wraps when its hypothetical main size exceeds the space left on the
		// line, and that size comes from the basis. Equal sizing used to use `basis-0`,
		// which reports a hypothetical size of zero, so `flex-wrap` never broke the line
		// and every template that asked for wrapping silently stayed on one line.
		const component: AppNode = {
			tag: "row",
			attributes: { id: "row-1", wrap: "wrap" },
			children: [
				{ tag: "header1", attributes: { id: "header-1" }, children: ["First"] },
				{ tag: "header1", attributes: { id: "header-2" }, children: ["Second"] },
			],
		}
		const Component = getComponentInfo("row").PreviewModeComponent

		const { container } = renderWithQueryClient(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		const row = container.firstElementChild
		expect(row).toHaveClass("flex-wrap")
		expect(row).not.toHaveClass("flex-nowrap")
		for (const label of ["First", "Second"]) {
			// A non-zero basis is the whole point: it is what gives the item a
			// hypothetical main size for the line-breaking algorithm to compare.
			expect(screen.getByText(label)).toHaveClass("basis-auto")
			expect(screen.getByText(label)).not.toHaveClass("basis-0")
		}
	})

	it("keeps a zero basis when the row does not wrap", () => {
		const component: AppNode = {
			tag: "row",
			attributes: { id: "row-1" },
			children: [{ tag: "header1", attributes: { id: "header-1" }, children: ["Only"] }],
		}
		const Component = getComponentInfo("row").PreviewModeComponent

		const { container } = renderWithQueryClient(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		expect(container.firstElementChild).toHaveClass("flex-nowrap")
		expect(screen.getByText("Only")).toHaveClass("basis-0")
	})

	it("leaves natural child sizing alone on a wrapping row", () => {
		const component: AppNode = {
			tag: "row",
			attributes: { id: "row-1", wrap: "wrap", "child-sizing": "natural" },
			children: [{ tag: "header1", attributes: { id: "header-1" }, children: ["Natural"] }],
		}
		const Component = getComponentInfo("row").PreviewModeComponent

		renderWithQueryClient(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		expect(screen.getByText("Natural")).not.toHaveClass("basis-auto", "basis-0", "flex-1")
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

	it("keeps edit-mode component wrappers in block flow", () => {
		const component: AppNode = {
			tag: "row",
			attributes: { id: "row-1" },
			children: [],
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

		expect(container.firstElementChild).toHaveClass("block")
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
		const wrapper = paragraph.closest(".block") ?? paragraph.closest("span") ?? paragraph.parentElement
		expect(wrapper).not.toHaveClass("min-h-0")
		expect(container.firstElementChild).toContainElement(paragraph)
	})

	it("does not reserve vertical space for an empty paragraph before an image", () => {
		const component: AppNode = {
			tag: "column",
			attributes: { id: "column-1" },
			children: [
				{
					tag: "paragraph",
					attributes: { id: "paragraph-1" },
					children: [],
				},
				{
					tag: "image",
					attributes: {
						id: "image-1",
						src: "https://example.com/image.jpg",
						alt: "Image",
						fallbackSrc: "",
						width: "100%",
						height: "auto",
					},
					children: [],
				},
			],
		}
		const Component = getComponentInfo("column").PreviewModeComponent

		renderWithQueryClient(
			<Component
				pageBuilderMode="preview"
				component={component}
				selectedComponentId=""
				selectedComponentAncestors={[]}
			/>
		)

		expect(screen.getByRole("img", { name: "Image" })).toBeInTheDocument()
		expect(document.querySelector("p")).not.toHaveClass("py-2")
	})

	it("applies childClassName to the page surface", () => {
		const component: AppNode = {
			tag: "page",
			attributes: { id: "page-1", title: "Page" },
			children: [],
		}
		const Component = getComponentInfo("page").PreviewModeComponent

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
