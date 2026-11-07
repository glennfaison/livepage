import type { AppNode } from "@/client/features/app-state"
import { applyTemplateFieldValues, clonePageTemplatePages, type PageTemplateDefinition } from "@/client/features/page-templates"
import { applyDesignEdits } from "./design-edits"
import type { DesignEdit } from "@/shared/features/prompt-assist"

/** The page a proposal stands for: the template's pages, then drafted copy, then design edits. */
export function composePages(
  template: PageTemplateDefinition,
  copy: Readonly<Record<string, string>>,
  edits: ReadonlyArray<DesignEdit>,
): ReadonlyArray<AppNode> {
  return applyDesignEdits(applyTemplateFieldValues(clonePageTemplatePages(template), template, copy), edits)
}
