/**
 * Editor chrome sits on top of arbitrary page content (including dark template
 * columns that set their own background and text color). Theme tokens alone are
 * not enough: `bg-background` blends into a dark canvas, and inherited
 * `text-*` from the page can leave icons the same color as the bar.
 *
 * This surface uses the popover pair (background + foreground together) plus a
 * border, shadow, and ring so the bar stays readable on light and dark content.
 */
export const editorChromeSurfaceClassName = [
  "bg-popover text-popover-foreground",
  "border border-border",
  "shadow-md ring-1 ring-foreground/20",
].join(" ")

export const editorChromeButtonClassName = [
  "text-popover-foreground",
  "hover:bg-accent hover:text-accent-foreground",
].join(" ")
