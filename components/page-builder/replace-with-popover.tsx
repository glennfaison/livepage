import { componentTagList } from "@/features/design-components"
import { ComponentTag, DesignComponent } from "@/features/design-components/types"
import { ComponentSelectorPopover } from "./component-selector-popover"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	onReplace,
}: {
	children: React.ReactNode
	currentComponent: DesignComponent<ComponentTag>
	onReplace: (newType: ComponentTag) => void
}) => {
	const tagList = componentTagList.filter((tag) => tag !== currentComponent.tag)

	const handleReplace = (newType: ComponentTag) => {
		onReplace(newType)
	}

	return (
		<ComponentSelectorPopover componentTagList={tagList} onSelect={handleReplace}>
			{children}
		</ComponentSelectorPopover>
	)
}