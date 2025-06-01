import { Plug } from "lucide-react"
import type { ConnectionId } from "./types"

export const id: ConnectionId = "rest-api" as const

export const label = "REST API"

export const keywords = ["rest", "api"]

export const Icon = <Plug className="h-4 w-4" />

export const defaultSettings = {
	url: "",
	"parse-result": "",
}

export const settingsFields = {
	url: {
		id: "url",
		type: "textarea",
		label: "REST API URL",
		placeholder: "Enter the REST API URL",
	},
	"parse-result": {
		id: "parse-result",
		type: "textarea",
		label: "JavaScript function to parse your results",
		placeholder: "Enter the function body",
	},
}

