import { componentTagList } from "@/features/design-components"
import { ComponentSelectorPopover } from "./component-selector-popover"
import { AppNode } from "../app-state"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	onReplace,
}: {
	children: React.ReactNode
	currentComponent: AppNode
	onReplace: (newType: string) => void
}) => {
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