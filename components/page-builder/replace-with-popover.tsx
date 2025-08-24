import { componentTagList } from "@/features/design-components"
import { DesignComponentTag, DesignComponent } from "@/features/design-components/types"
import { ComponentSelectorPopover } from "./component-selector-popover"

export const ReplaceWithPopover = ({
	children,
	currentComponent,
	onReplace,
}: {
	children: React.ReactNode
	currentComponent: DesignComponent<DesignComponentTag>
	onReplace: (newType: DesignComponentTag) => void
}) => {
	const tagList = componentTagList.filter((tag) => tag !== currentComponent.tag)

	const handleReplace = (newType: DesignComponentTag) => {
		onReplace(newType)
	}

	return (
		<ComponentSelectorPopover componentTagList={tagList} onSelect={handleReplace}>
			{children}
		</ComponentSelectorPopover>
	)
}