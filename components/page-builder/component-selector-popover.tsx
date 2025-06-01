import { Search } from "lucide-react"
import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ComponentTag } from "@/features/design-components/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getComponentInfo } from "@/features/design-components"

// Component selector popover
export const ComponentSelectorPopover = ({
	onSelect,
	children,
	componentTagList,
}: {
	onSelect: (type: ComponentTag) => void
	parentId?: string
	children: React.ReactNode
	componentTagList: ComponentTag[]
}) => {
	const [searchTerm, setSearchTerm] = React.useState("")
  const [open, setOpen] = React.useState(false)

	const filteredComponents = React.useMemo(() => {
		const components = componentTagList.map((componentTag) => getComponentInfo(componentTag))
		if (!searchTerm.trim()) return components

		const search = searchTerm.toLowerCase()
		return components.filter(
			(component) =>
				component.label.toLowerCase().includes(search) ||
				component.keywords.some((keyword) => keyword.includes(search)),
		)
	}, [searchTerm, componentTagList])

	const handleSelect = (type: ComponentTag) => {
		onSelect(type)
		if (closePopover) {
			closePopover()
		}
	}

  const closePopover = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0">
				<div className="bg-background border rounded-lg shadow-lg -m-1">
					{/* Header */}
					<header className="bg-foreground text-background p-3 rounded-t-lg">
						<h2 className="text-sm font-semibold">Select Component</h2>
					</header>

					{/* Search Bar */}
					<div className="relative p-3 border-b">
						<Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search components..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 h-8"
						/>
					</div>

					{/* Components Grid */}
					<div className="p-3">
						<div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
							{filteredComponents.length > 0 ? (
								filteredComponents.map((component) => (
									<ComponentSelectorButton
										key={component.tag}
										icon={component.Icon}
										label={component.label}
										onClick={() => handleSelect(component.tag)}
									/>
								))
							) : (
								<div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
							)}
						</div>
					</div>
				</div>
      </PopoverContent>
    </Popover>
	)
}

// Component selector button
const ComponentSelectorButton = ({
	icon,
	label,
	onClick,
}: {
	icon: React.ReactNode
	label: string
	onClick: () => void
}) => {
	return (
		<Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-2 gap-1" onClick={onClick}>
			<div className="p-1 bg-muted rounded-md">{icon}</div>
			<span className="text-xs">{label}</span>
		</Button>
	)
}