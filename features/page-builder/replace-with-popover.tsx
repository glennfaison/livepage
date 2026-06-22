import { componentTagList } from "@/features/design-components"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { ReplaceWithPopoverProps } from "./types"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	onReplace,
}: ReplaceWithPopoverProps) => {
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