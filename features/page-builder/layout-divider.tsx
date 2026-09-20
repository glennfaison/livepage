import { componentTagList } from "@/features/design-components"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNodeTag } from "@/features/types"

export const Divider = ({
  orientation,
  onAddComponent,
  index,
  isVisible,
}: Readonly<{
  orientation: "horizontal" | "vertical"
  onAddComponent: (type: AppNodeTag, index: number) => void
  index: number
  isVisible: boolean
}>) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  isVisible = isVisible || popoverOpen

  const handleAddComponent = (type: AppNodeTag) => {
    onAddComponent(type, index)
    setPopoverOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group",
        "cursor-pointer bg-transparent hover:bg-gray-400 hover:visible",
        isVisible ? "bg-gray-400" : "invisible",
        orientation === "horizontal" ? "flex-row h-2 w-full" : "flex-col w-2 self-stretch",
        isVisible ? "bg-primary/45" : "bg-transparent hover:bg-primary/30",
      )}
    >
      <ComponentSelectorPopover onSelect={handleAddComponent} componentTagList={componentTagList}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative z-20 size-7 rounded-full border bg-background shadow-sm transition-transform hover:scale-110",
            "text-primary hover:bg-primary hover:text-primary-foreground",
          )}
          onClick={(e) => {
            e.stopPropagation()
            setPopoverOpen(true)
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </ComponentSelectorPopover>
    </div>
  )
}


export const useDividerVisibility = () => {
  const [visibleVerticalDividers, setVisibleVerticalDividers] = React.useState<Set<number>>(new Set())
  const [visibleHorizontalDividers, setVisibleHorizontalDividers] = React.useState<Set<number>>(new Set())
  const hideTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})
  const visibilityTimeoutMS = 300

  const showVerticalDivider = (index: number) => {
    if (hideTimeoutRef.current[`v${index}`]) {
      clearTimeout(hideTimeoutRef.current[`v${index}`])
      delete hideTimeoutRef.current[`v${index}`]
    }
    setVisibleVerticalDividers((prev) => new Set(prev).add(index))
  }

  const showHorizontalDivider = (index: number) => {
    if (hideTimeoutRef.current[`h${index}`]) {
      clearTimeout(hideTimeoutRef.current[`h${index}`])
      delete hideTimeoutRef.current[`h${index}`]
    }
    setVisibleHorizontalDividers((prev) => new Set(prev).add(index))
  }

  const hideVerticalDivider = (index: number) => {
    hideTimeoutRef.current[`v${index}`] = setTimeout(() => {
      setVisibleVerticalDividers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, visibilityTimeoutMS)
  }

  const hideHorizontalDivider = (index: number) => {
    hideTimeoutRef.current[`h${index}`] = setTimeout(() => {
      setVisibleHorizontalDividers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, visibilityTimeoutMS)
  }

  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const y = e.clientY - rect.top
    const height = rect.height

    if (x < width * 0.3) {
      const leftDividerIndex = childIndex * 2
      showVerticalDivider(leftDividerIndex)
    } else if (x > width * 0.7) {
      const rightDividerIndex = (childIndex + 1) * 2
      showVerticalDivider(rightDividerIndex)
    }

    if (y < height * 0.3) {
      const topDividerIndex = childIndex * 2
      showHorizontalDivider(topDividerIndex)
    } else if (y > height * 0.7) {
      const bottomDividerIndex = (childIndex + 1) * 2
      showHorizontalDivider(bottomDividerIndex)
    }
  }

  const handleChildMouseLeave = (childIndex: number) => {
    const leftDividerIndex = 2 * childIndex
    const rightDividerIndex = 2 * childIndex + 2
    const topDividerIndex = 2 * childIndex
    const bottomDividerIndex = 2 * childIndex + 2
    hideVerticalDivider(leftDividerIndex)
    hideVerticalDivider(rightDividerIndex)
    hideHorizontalDivider(topDividerIndex)
    hideHorizontalDivider(bottomDividerIndex)
  }

  return {
    visibleVerticalDividers,
    visibleHorizontalDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
  }
}
