/** A template node, before it is validated against the app-node schema. */
export type TemplateNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateNode | string>
}>

/** Creates a template node with its `id` written into attributes. */
export function node(
  tag: string,
  id: string,
  attributes: Readonly<Record<string, string>> = {},
  children: ReadonlyArray<TemplateNode | string> = [],
): TemplateNode {
  return {
    tag,
    attributes: {
      id,
      ...attributes,
    },
    children,
  } as const
}

/** Creates a text leaf node (header, paragraph, badge, button, callout, inline-text, etc.). */
export function text(
  tag: string,
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
): TemplateNode {
  return node(tag, id, attributes, [content])
}
