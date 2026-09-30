import type { AppNode } from "@/features/app-state"
import { applyTemplateFieldValues, cloneTemplatePages, type PageTemplateDefinition } from "@/features/templates"
import { applyDesignEdits } from "./design-edits"
import type { DesignEdit } from "./schema"

/** The page a proposal stands for: the template's pages, then drafted copy, then design edits. */
export function composePages(
  template: PageTemplateDefinition,
  copy: Readonly<Record<string, string>>,
  edits: ReadonlyArray<DesignEdit>,
): ReadonlyArray<AppNode> {
  return applyDesignEdits(applyTemplateFieldValues(cloneTemplatePages(template), template, copy), edits)
}
