"use client"

import type { DesignComponentAttributes, DesignComponentMetadata, DesignComponentTag, DesignComponent, DesignComponentSetting } from "./types"

import * as Header1 from "./header1"
import * as Header2 from "./header2"
import * as Header3 from "./header3"
import * as Paragraph from "./paragraph"
import * as InlineText from "./inline-text"
import * as Button from "./button"
import * as Image from "./image"
import * as Row from "./row"
import * as Column from "./column"
import * as Page from "./page-component"

// Helper function to get component data by type using exhaustive switch
export function getComponentInfo<Tag extends DesignComponentTag>(tag: Tag): DesignComponentMetadata<Tag> {
  switch (tag) {
    case "header1":
      return Header1 as unknown as DesignComponentMetadata<Tag>;
    case "header2":
      return Header2 as unknown as DesignComponentMetadata<Tag>;
    case "header3":
      return Header3 as unknown as DesignComponentMetadata<Tag>;
    case "paragraph":
      return Paragraph as unknown as DesignComponentMetadata<Tag>;
    case "inline-text":
      return InlineText as unknown as DesignComponentMetadata<Tag>;
    case "button":
      return Button as unknown as DesignComponentMetadata<Tag>;
    case "image":
      return Image as unknown as DesignComponentMetadata<Tag>;
    case "row":
      return Row as unknown as DesignComponentMetadata<Tag>;
    case "column":
      return Column as unknown as DesignComponentMetadata<Tag>;
    case "page":
      return Page as unknown as DesignComponentMetadata<Tag>
    default:
      const _unexpected: never = tag
      throw new Error(`Unknown component type: ${_unexpected}`)
  }
}

// Helper function to create a new design component
export function createDesignComponent<Tag extends DesignComponentTag>(
  tag: Tag,
  id: string,
  overrideProps?: Partial<DesignComponentAttributes<Tag>>,
): DesignComponent<Tag> {
  const data = getComponentInfo(tag)
  const defaultAttributes = {} as DesignComponentAttributes<Tag>
  for (const key in data.settingsFields) {
    if (key === "content") {
      continue
    }
    // @ts-expect-error ignore error on next line
    defaultAttributes[key] = data.settingsFields[key].defaultValue
  }

  const defaultChildren =
    "content" in data.settingsFields
      ? (data.settingsFields as Record<string, DesignComponentSetting<Tag>>).content?.defaultValue || []
      : []

  return {
    tag: tag,
    attributes: { ...defaultAttributes, ...overrideProps, id: `${tag}-${id}`, } as DesignComponentAttributes<Tag>,
    // @ts-expect-error TODO: fix the type error here
    children: defaultChildren,
  }
}

export const componentTagList = [
  Header1.tag,
  Header2.tag,
  Header3.tag,
  Paragraph.tag,
  InlineText.tag,
  Button.tag,
  Image.tag,
  Row.tag,
  Column.tag,
]
