import { ComponentOperations, ComponentTag } from "@/features/design-components/types"
import React from "react"

export const ComponentOperationsContext = React.createContext<ComponentOperations<ComponentTag>>({} as ComponentOperations<ComponentTag>)

export function useComponentOperationsContext() {
  return React.useContext(ComponentOperationsContext)
}