import { componentTagList } from "../primitives"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNode, AppNodeTag } from "@/client/features/types"
import type React from "react"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	onReplace,
}: Readonly<{
	children: React.ReactNode
	currentComponent: AppNode
	onReplace: (newType: AppNodeTag) => void
}>) => {
	const tagList = componentTagList.filter((tag) => tag !== currentComponent.tag)

	const handleReplace = (newType: AppNodeTag) => {
		onReplace(newType)
	}

	return (
		<ComponentSelectorPopover componentTagList={tagList} onSelect={handleReplace}>
			{children}
		</ComponentSelectorPopover>
	)
}