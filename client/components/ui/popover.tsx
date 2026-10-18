"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/client/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * Caps a popover panel so a tall panel stays inside the viewport: Radix
 * publishes the space it measured between the trigger and the nearest viewport
 * edge as `--radix-popper-available-height` (collision padding already
 * deducted), so the panel flips onto the side with more room and never outgrows
 * it. The 600px ceiling keeps a panel from filling a roomy viewport, and the
 * `90vh` fallback covers the frame before Radix first reports a measurement.
 */
const POPOVER_PANEL_MAX_HEIGHT_CLASS = "max-h-[min(600px,var(--radix-popper-available-height,90vh))]"

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, POPOVER_PANEL_MAX_HEIGHT_CLASS }
