import { componentTagList } from "../primitives"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNode } from "@/client/features/types"
import type React from "react"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	onReplace,
}: Readonly<{
	children: React.ReactNode
	currentComponent: AppNode
	onReplace: (newType: string) => void
}>) => {
	const tagList = componentTagList.filter((tag) => tag !== currentComponent.tag)

	const handleReplace = (newType: string) => {
		onReplace(newType)
	}

	return (
		<ComponentSelectorPopover componentTagList={tagList} onSelect={handleReplace}>
			{children}
		</ComponentSelectorPopover>
	)
}