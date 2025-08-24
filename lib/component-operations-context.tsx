import { DesignComponentOperations, DesignComponentTag } from "@/features/design-components/types"
import React from "react"

export const ComponentOperationsContext = React.createContext<DesignComponentOperations<DesignComponentTag>>({} as DesignComponentOperations<DesignComponentTag>)

export function useComponentOperationsContext() {
  return React.useContext(ComponentOperationsContext)
}