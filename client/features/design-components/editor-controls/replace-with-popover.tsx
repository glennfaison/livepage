import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNode, AppNodeTag } from "@/client/features/types"
import type React from "react"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	parentTag,
	onReplace,
}: Readonly<{
	children: React.ReactNode
	currentComponent: AppNode
	parentTag?: AppNodeTag
	onReplace: (newType: AppNodeTag) => void
}>) => {
	const handleReplace = (newType: AppNodeTag) => {
		onReplace(newType)
	}

	return (
		<ComponentSelectorPopover parentTag={parentTag} excludeTag={currentComponent.tag} onSelect={handleReplace}>
			{children}
		</ComponentSelectorPopover>
	)
}