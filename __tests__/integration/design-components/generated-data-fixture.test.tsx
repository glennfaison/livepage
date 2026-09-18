import { readFileSync } from "node:fs"
import { join } from "node:path"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { getComponentInfo } from "@/features/design-components"
import { deserializeAppStateFromShortcode } from "@/features/serializers"

describe("Generated Data preview layout fixture", () => {
	it("renders connected preview headers inside a block wrapper", async () => {
		const input = readFileSync(join(process.cwd(), "__tests__/fixtures/shortcode/generated-data-preview-layout.txt"), "utf8")
		expect(input).toContain("[#data.name#], [/inline-text]")
		const [page] = deserializeAppStateFromShortcode(input)
		const Page = getComponentInfo(page.tag).ViewModeComponent
		const queryClient = new QueryClient()

		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<Page
					pageBuilderMode="preview"
					component={page}
					selectedComponentId=""
					selectedComponentAncestors={[]}
				/>
			</QueryClientProvider>,
		)

		const firstHeader = (await screen.findAllByText("Leanne Graham")).find((element) => element.tagName === "H1")
		expect(firstHeader).toBeDefined()
		const headers = container.querySelectorAll("h1")
		const inlineTextValues = Array.from(container.querySelectorAll("span")).map((element) => element.textContent)

		expect(headers).toHaveLength(10)
		expect(firstHeader?.parentElement).toHaveClass("block")
		expect(firstHeader?.parentElement?.querySelectorAll("h1")).toHaveLength(10)
		expect(inlineTextValues).toEqual([
			"Leanne Graham,",
			"Ervin Howell,",
			"Clementine Bauch,",
			"Patricia Lebsack,",
			"Chelsey Dietrich,",
			"Mrs. Dennis Schulist,",
			"Kurtis Weissnat,",
			"Nicholas Runolfsdottir V,",
			"Glenna Reichert,",
			"Clementina DuBuque,",
		])
	})
})
