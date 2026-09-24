import { replaceDataSourceComponentProperties } from "@/features/design-component-runtime/primitives"
import { replaceCurrentDatePlaceholderInString } from "@/features/placeholders/current-date"
import { replaceDataSourcePlaceholdersInString } from "@/features/placeholders/data-source"

function replacePlaceholdersInString(str: string, data: unknown, now: Date = new Date()): string {
  return replaceCurrentDatePlaceholderInString(replaceDataSourcePlaceholdersInString(str, data), now)
}

describe("placeholders", () => {
  it("replaces data-source expressions inside strings", () => {
    const result = replaceDataSourcePlaceholdersInString("Hello [#data.user.name#]", {
      user: { name: "Ada" },
    })

    expect(result).toBe("Hello Ada")
  })

  it("replaces the current date placeholder with an ISO timestamp", () => {
    const now = new Date("2026-06-22T23:08:03.059Z")

    expect(replaceCurrentDatePlaceholderInString("Today is [#CURRENT_DATE#]", now)).toBe(
      "Today is 2026-06-22T23:08:03.059Z",
    )
  })

  it("replaces both data-source and computable placeholders in component trees", () => {
    const now = new Date("2026-06-22T23:08:03.059Z")
    const component = {
      tag: "section",
      attributes: {
        id: "section-1",
        title: "Hello [#data.user.name#] on [#CURRENT_DATE#]",
        "__datasource__": "encoded-settings",
      },
      children: [
        "Body [#data.message#] [#CURRENT_DATE#]",
        {
          tag: "span",
          attributes: {
            id: "child-1",
            label: "[#data.child#]",
          },
          children: [],
        },
      ],
    }

    const result = replaceDataSourceComponentProperties(component, {
      user: { name: "Ada" },
      message: "world",
      child: "nested",
    }, now)

    expect(result.attributes.title).toBe("Hello Ada on 2026-06-22T23:08:03.059Z")
    expect(result.children[0]).toBe("Body world 2026-06-22T23:08:03.059Z")
    expect((result.children[1] as { attributes: { label: string } }).attributes.label).toBe("nested")
    expect(result.attributes.__datasource__).toBe("encoded-settings")
  })

  it("composes the placeholder string helper", () => {
    const now = new Date("2026-06-22T23:08:03.059Z")
    expect(
      replacePlaceholdersInString("[#data.user.name#] [#CURRENT_DATE#]", { user: { name: "Ada" } }, now),
    ).toBe("Ada 2026-06-22T23:08:03.059Z")
  })
})
