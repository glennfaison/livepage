import type { AppNode } from "@/client/features/app-state"
import { applyTemplateFieldValues, cloneTemplatePages, type PageTemplateDefinition } from "@/client/features/templates"
import { applyDesignEdits } from "./design-edits"
import type { DesignEdit } from "@/shared/features/prompt-assist"

/** The page a proposal stands for: the template's pages, then drafted copy, then design edits. */
export function composePages(
  template: PageTemplateDefinition,
  copy: Readonly<Record<string, string>>,
  edits: ReadonlyArray<DesignEdit>,
): ReadonlyArray<AppNode> {
  return applyDesignEdits(applyTemplateFieldValues(cloneTemplatePages(template), template, copy), edits)
}
