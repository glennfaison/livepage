import { Linkedin } from "lucide-react"
import type { DataSourceInfo } from "@/client/features/types"

const settings = [] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(): Promise<unknown> {
  const response = await fetch("/api/linkedin-profile/profile", {
    credentials: "same-origin",
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(response.status === 401
      ? "Connect a LinkedIn account to use this profile."
      : "LinkedIn profile is unavailable.")
  }
  const result: unknown = await response.json()
  if (!result || typeof result !== "object" || !("profile" in result)) {
    throw new Error("LinkedIn profile is unavailable.")
  }
  return result.profile
}

export const dataSourceInfo = {
  id: "linkedin-profile",
  label: "LinkedIn Profile",
  keywords: ["linkedin", "profile", "openid"],
  Icon: <Linkedin className="h-4 w-4" />,
  settings,
  tryConnection,
} as const satisfies DataSourceInfo
