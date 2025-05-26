"use client"

import type { ComponentInfo, ComponentType } from "./types"

import * as Header1 from "./header1"
import * as Header2 from "./header2"
import * as Header3 from "./header3"
import * as Paragraph from "./paragraph"
import * as Span from "./span"
import * as Button from "./button"
import * as Image from "./image"
import * as Row from "./row"
import * as Column from "./column"

// Helper function to get component data by type using exhaustive switch
export function getComponentInfo<Tag extends ComponentType>(type: Tag): ComponentInfo<Tag> {
  switch (type) {
    case "header1":
      return Header1 as unknown as ComponentInfo<Tag>;
    case "header2":
      return Header2 as unknown as ComponentInfo<Tag>;
    case "header3":
      return Header3 as unknown as ComponentInfo<Tag>;
    case "paragraph":
      return Paragraph as unknown as ComponentInfo<Tag>;
    case "span":
      return Span as unknown as ComponentInfo<Tag>;
    case "button":
      return Button as unknown as ComponentInfo<Tag>;
    case "image":
      return Image as unknown as ComponentInfo<Tag>;
    case "row":
      return Row as unknown as ComponentInfo<Tag>;
    case "column":
      return Column as unknown as ComponentInfo<Tag>;
    default:
      const _unexpected: never = type
      throw new Error(`Unknown component type: ${_unexpected}`)
  }
}
