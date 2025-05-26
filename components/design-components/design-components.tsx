"use client"

import { Button } from "@/components/ui/button"
import { Heading, Type, ImageIcon, Code, AlignVerticalSpaceBetween, AlignHorizontalSpaceBetween } from "lucide-react"
import type { ComponentType, ComponentProps, ComponentData } from "./types"

//#region Individual Component Definitions
const Header1Component = ({ component, previewMode, setSelectedComponent, updateComponent }: ComponentProps) => {
  return (
    <h1
      className="text-4xl font-bold py-2"
      contentEditable={!previewMode}
      suppressContentEditableWarning
      onBlur={(e) => updateComponent(component.id, { content: e.currentTarget.textContent || "" })}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    >
      {component.attributes?.content}
    </h1>
  )
}

const Header2Component = ({ component, previewMode, setSelectedComponent, updateComponent }: ComponentProps) => {
  return (
    <h2
      className="text-3xl font-bold py-2"
      contentEditable={!previewMode}
      suppressContentEditableWarning
      onBlur={(e) => updateComponent(component.id, { content: e.currentTarget.textContent || "" })}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    >
      {component.attributes?.content}
    </h2>
  )
}

const Header3Component = ({ component, previewMode, setSelectedComponent, updateComponent }: ComponentProps) => {
  return (
    <h3
      className="text-2xl font-bold py-2"
      contentEditable={!previewMode}
      suppressContentEditableWarning
      onBlur={(e) => updateComponent(component.id, { content: e.currentTarget.textContent || "" })}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    >
      {component.attributes?.content}
    </h3>
  )
}

const ParagraphComponent = ({ component, previewMode, setSelectedComponent, updateComponent }: ComponentProps) => {
  return (
    <p
      className="py-2"
      contentEditable={!previewMode}
      suppressContentEditableWarning
      onBlur={(e) => updateComponent(component.id, { content: e.currentTarget.textContent || "" })}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    >
      {component.attributes?.content}
    </p>
  )
}

const SpanComponent = ({ component, previewMode, setSelectedComponent, updateComponent }: ComponentProps) => {
  return (
    <span
      className="inline"
      contentEditable={!previewMode}
      suppressContentEditableWarning
      onBlur={(e) => updateComponent(component.id, { content: e.currentTarget.textContent || "" })}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    >
      {component.attributes?.content}
    </span>
  )
}

const ButtonComponent = ({ component, previewMode, setSelectedComponent, updateComponent }: ComponentProps) => {
  return (
    <Button
      contentEditable={!previewMode}
      suppressContentEditableWarning
      onBlur={(e) => updateComponent(component.id, { content: e.currentTarget.textContent || "" })}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    >
      {component.attributes?.content}
    </Button>
  )
}

const ImageComponent = ({ component, previewMode, setSelectedComponent }: ComponentProps) => {
  return (
    <img
      src={component.attributes?.src || "/placeholder.svg"}
      alt={component.attributes?.alt}
      className="max-w-full h-auto"
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation()
          setSelectedComponent(component.id)
        }
      }}
    />
  )
}

const RowComponent = ({ children, ...props }) => {
  return (
    <div className="p-4 border border-dashed border-gray-300 min-h-[50px] flex flex-row gap-2 justify-center" {...props}>
      {children}
    </div>
  );
};

const ColumnComponent = ({ children, ...props }) => {
  return (
    <div className="p-4 border border-dashed border-gray-300 min-h-[50px] flex flex-col gap-2" {...props}>
      {children}
    </div>
  );
};
//#endregion

// Helper function to get component data by type using exhaustive switch
export function getComponentData<Tag extends ComponentType>(type: Tag): ComponentData<Tag> {
  switch (type) {
    case "heading1":
      return {
        tag: "heading1",
        label: "Heading 1",
        icon: <Heading className="h-4 w-4" />,
        keywords: ["h1", "title", "header", "heading", "large"],
        defaultProps: { content: "Heading 1" },
        settingsFields: ["content"],
        renderComponent: Header1Component,
      }

    case "heading2":
      return {
        tag: "heading2",
        label: "Heading 2",
        icon: <Heading className="h-4 w-4" />,
        keywords: ["h2", "subtitle", "header", "heading", "medium"],
        defaultProps: { content: "Heading 2" },
        settingsFields: ["content"],
        renderComponent: Header2Component,
      } as ComponentData<Tag>

    case "heading3":
      return {
        tag: "heading3",
        label: "Heading 3",
        icon: <Heading className="h-4 w-4" />,
        keywords: ["h3", "subheading", "header", "heading", "small"],
        defaultProps: { content: "Heading 3" },
        settingsFields: ["content"],
        renderComponent: Header3Component,
      } as ComponentData<Tag>

    case "paragraph":
      return {
        tag: "paragraph",
        label: "Paragraph",
        icon: <Type className="h-4 w-4" />,
        keywords: ["p", "text", "content", "paragraph", "body"],
        defaultProps: {
          content:
            "Morbi consequat justo enim, sed accumsan metus blandit eget. Etiam ornare neque sagittis metus hendrerit tincidunt. Sed sed vulputate quam. Vivamus rutrum elit quis mauris aliquet dictum. Praesent iaculis ornare posuere. Sed pretium sed mauris non mollis. Pellentesque sem purus, sagittis sed odio commodo, faucibus vehicula elit. Mauris vestibulum euismod mi, feugiat accumsan mauris imperdiet eget. Ut sit amet dolor mattis, consectetur est id, placerat tellus. Proin nisl odio, elementum sed porttitor ut, tempus non neque. In hac habitasse platea dictumst. Proin at lorem lacinia, ullamcorper lorem eget, fringilla massa. Suspendisse consequat, lectus sit amet congue tincidunt, neque felis pellentesque nulla, ac pharetra lectus elit eget neque. Sed feugiat tincidunt leo, ac pretium metus. In suscipit iaculis mi, sit amet euismod justo posuere sit amet.",
        },
        settingsFields: ["content"],
        renderComponent: ParagraphComponent,
      } as ComponentData<Tag>

    case "span":
      return {
        tag: "span",
        label: "Span",
        icon: <Type className="h-4 w-4" />,
        keywords: ["span", "inline", "text", "small"],
        defaultProps: { content: "Inline text" },
        settingsFields: ["content"],
        renderComponent: SpanComponent,
      } as ComponentData<Tag>

    case "button":
      return {
        tag: "button",
        label: "Button",
        icon: <Code className="h-4 w-4" />,
        keywords: ["btn", "button", "click", "action", "cta"],
        defaultProps: { content: "Button" },
        settingsFields: ["content"],
        renderComponent: ButtonComponent,
      } as ComponentData<Tag>

    case "image":
      return {
        tag: "image",
        label: "Image",
        icon: <ImageIcon className="h-4 w-4" />,
        keywords: ["img", "picture", "photo", "image", "media"],
        defaultProps: {
          src: "/placeholder.svg?height=200&width=400",
          alt: "Placeholder image",
        },
        settingsFields: ["src", "alt"],
        renderComponent: ImageComponent,
      } as ComponentData<Tag>

    case "row":
      return {
        tag: "row",
        label: "Row",
        icon: <AlignVerticalSpaceBetween className="h-4 w-4" />,
        keywords: ["row", "horizontal", "layout", "container"],
        defaultProps: { columns: 1 },
        settingsFields: [],
        renderComponent: RowComponent,
      } as ComponentData<Tag>

    case "column":
      return {
        tag: "column",
        label: "Column",
        icon: <AlignHorizontalSpaceBetween className="h-4 w-4" />,
        keywords: ["column", "vertical", "layout", "container"],
        defaultProps: {},
        settingsFields: [],
        renderComponent: ColumnComponent,
      } as ComponentData<Tag>

    default:
      const _unexpected: never = type
      throw new Error(`Unknown component type: ${_unexpected}`)
  }
}
