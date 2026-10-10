"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return

    const lightIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="light"]')
    const darkIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"][media*="dark"]')
    const defaultIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]:not([media])')

    if (resolvedTheme === "dark") {
      if (lightIcon) lightIcon.disabled = true
      if (darkIcon) darkIcon.disabled = false
      if (defaultIcon) defaultIcon.disabled = true
    } else {
      if (lightIcon) lightIcon.disabled = false
      if (darkIcon) darkIcon.disabled = true
      if (defaultIcon) defaultIcon.disabled = true
    }
  }, [resolvedTheme])

  return null
}