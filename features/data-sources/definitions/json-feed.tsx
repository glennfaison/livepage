import { Braces } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/features/types"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "JSON Feed URL",
		placeholder: "https://example.com/feed.json",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const raw = componentDataSourceSettings.url
	const url = (Array.isArray(raw) ? raw.join("") : String(raw ?? "")).trim()
	if (!url) throw new Error("Expected JSON Feed settings to provide a URL string")

	const result = await fetch(url, { headers: { accept: "application/feed+json, application/json" } })
	if (!result.ok) throw new Error(`JSON Feed request failed with status ${result.status}`)
	const feed = await result.json()
	if (feed?.version !== "https://jsonfeed.org/version/1" && feed?.version !== "https://jsonfeed.org/version/1.1") {
		throw new Error("Response is not a supported JSON Feed version")
	}
	if (typeof feed.title !== "string") throw new Error("JSON Feed must include a title")
	return {
		title: feed.title,
		home_page_url: feed.home_page_url ?? "",
		feed_url: feed.feed_url ?? url,
		authors: feed.authors ?? [],
		items: Array.isArray(feed.items) ? feed.items : [],
	}
}

export const dataSourceInfo = {
	id: "json-feed",
	label: "JSON Feed",
	keywords: ["json", "feed", "blog", "syndication"],
	Icon: <Braces className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
