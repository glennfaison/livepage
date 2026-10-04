export type Rgb = { r: number; g: number; b: number }

export const CONTRAST_DARK = "#18181b"
export const CONTRAST_LIGHT = "#fafafa"

const NAMED_COLORS: Record<string, Rgb> = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  navy: { r: 0, g: 0, b: 128 },
  silver: { r: 192, g: 192, b: 192 },
  orange: { r: 255, g: 165, b: 0 },
  purple: { r: 128, g: 0, b: 128 },
}

const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n)))

const parseChannel = (raw: string): number | null => {
  const value = raw.trim()
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return null
  return clamp(value.endsWith("%") ? (n / 100) * 255 : n)
}

/** Returns null for transparent (alpha 0) or unparseable colors. */
export const parseCssColor = (css: string | null | undefined): Rgb | null => {
  if (!css) return null
  const value = css.trim().toLowerCase()
  if (!value || value === "transparent") return null

  if (value in NAMED_COLORS) return NAMED_COLORS[value]

  if (value.startsWith("#")) {
    let hex = value.slice(1)
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join("")
    if (hex.length !== 6 && hex.length !== 8) return null
    if (!/^[0-9a-f]+$/.test(hex)) return null
    if (hex.length === 8 && Number.parseInt(hex.slice(6), 16) === 0) return null
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    }
  }

  const match = /^rgba?\(([^)]+)\)$/.exec(value)
  if (!match) return null
  const parts = match[1].split(/[\s,/]+/).filter(Boolean)
  if (parts.length < 3) return null
  const [r, g, b] = parts.slice(0, 3).map(parseChannel)
  if (r === null || g === null || b === null) return null
  if (parts.length >= 4) {
    const rawAlpha = parts[3]
    const alpha = rawAlpha.endsWith("%") ? Number.parseFloat(rawAlpha) / 100 : Number.parseFloat(rawAlpha)
    if (alpha === 0) return null
  }
  return { r, g, b }
}

export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export const getContrastColorForBackground = (
  bg: string | Rgb | null | undefined,
  fallback: string = CONTRAST_DARK,
): string => {
  const rgb = typeof bg === "string" || bg == null ? parseCssColor(bg) : bg
  if (!rgb) return fallback
  return relativeLuminance(rgb) > 0.179 ? CONTRAST_DARK : CONTRAST_LIGHT
}
