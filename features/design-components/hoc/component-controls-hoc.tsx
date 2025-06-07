import { ReplaceWithPopover } from "@/components/page-builder/replace-with-popover";
import { SettingsPopover } from "@/components/page-builder/settings-popover";
import { Button } from "@/components/ui/button";
import { getComponentInfo } from "@/features/design-components";
import { ComponentAttributes, ComponentProps } from "@/features/design-components/types";
import { ComponentTag } from "@/features/design-components/types";
import { cn } from "@/lib/utils";
import { Settings, Replace, Copy, Trash2, Move } from "lucide-react";


function ComponentControls<Tag extends ComponentTag>({
  component,
  updateComponent,
  duplicateComponent,
  removeComponent,
  replaceComponent,
}: ComponentProps<Tag>) {
  const { label } = getComponentInfo(component.tag)

  const handleReplace = (newType: ComponentTag) => {
    replaceComponent(component.id, newType);
  }

  return (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">{label}</span>
      <SettingsPopover
        component={component}
        onSave={(props) => updateComponent(component.id, props as ComponentAttributes<Tag>)}
      >
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <ReplaceWithPopover currentComponent={component} onReplace={handleReplace}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Replace className="h-4 w-4" />
        </Button>
      </ReplaceWithPopover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          duplicateComponent?.(component.id)
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          removeComponent(component.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function withEditorControls<Tag extends ComponentTag>(
	WrappedComponent: React.ComponentType<ComponentProps<Tag>>
) {
	return function ComponentWithControls(props: ComponentProps<Tag>) {
		const showControls = props.selectedComponentId === props.component.id
		const wrapperProps = {
			className: cn(
				"relative border border-transparent transition-all",
				showControls && "border-primary",
				"hover:border-gray-300",
			),
			onClick: (e: React.MouseEvent) => {
				e.stopPropagation()
				props.setSelectedComponent(props.component.id)
			},
		}
		return (
			<div {...wrapperProps}>
				{props.component.id === props.selectedComponentId && <ComponentControls {...props} />}
				<WrappedComponent {...props} />
			</div>
		)
	}
}