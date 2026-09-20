import { Rss } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/features/types"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "RSS feed URL",
		placeholder: "https://example.com/feed.xml",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

function textContent(element: Element | null): string {
	return element?.textContent?.trim() ?? ""
}

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const urlValue = componentDataSourceSettings.url
	const url = Array.isArray(urlValue) ? urlValue.join("") : String(urlValue ?? "")
	if (!url.trim()) {
		throw new Error("Expected RSS feed settings to provide a URL string")
	}

	const result = await fetch(url)
	if (!result.ok) {
		throw new Error(`RSS feed request failed with status ${result.status}`)
	}

	const xml = await result.text()
	const document = new DOMParser().parseFromString(xml, "application/xml")
	const parserError = document.querySelector("parsererror")
	if (parserError) {
		throw new Error("RSS feed returned invalid XML")
	}

	const channel = document.querySelector("channel")
	if (!channel) {
		throw new Error("RSS feed did not contain a channel")
	}

	return {
		title: textContent(channel.querySelector("title")),
		description: textContent(channel.querySelector("description")),
		link: textContent(channel.querySelector("link")),
		items: Array.from(channel.querySelectorAll(":scope > item")).map((item) => ({
			title: textContent(item.querySelector("title")),
			link: textContent(item.querySelector("link")),
			description: textContent(item.querySelector("description")),
			pubDate: textContent(item.querySelector("pubDate")),
			guid: textContent(item.querySelector("guid")),
		})),
	}
}

export const dataSourceInfo = {
	id: "rss-feed",
	label: "RSS Feed",
	keywords: ["rss", "feed", "xml", "syndication"],
	Icon: <Rss className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
