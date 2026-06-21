import { Operations } from "@/features/design-components/types"
import React from "react"

export const ComponentOperationsContext = React.createContext<Operations>({} as Operations)

export function useComponentOperationsContext() {
  return React.useContext(ComponentOperationsContext)
}