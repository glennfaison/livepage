import React from "react"
import { Activity } from "lucide-react"
import { withDataSource } from "@/features/data-sources"
import { withEditorControls } from "@/features/page-builder/editor-controls"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createColorAttribute, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses } from "@/features/design-component-runtime/primitives"
import { cn } from "@/lib/utils"

const tag = "line-chart" as const
const label = "Line Chart"
const keywords = ["chart", "line chart", "graph", "trend", "analytics", "diagnosis", "vitals"]

const defaultCategories = ["Oct 2023", "Nov 2023", "Dec 2023", "Jan 2024", "Feb 2024", "Mar 2024"] as const
const defaultSeriesAValues = [120, 120, 138, 158, 163, 163] as const
const defaultSeriesBValues = [80, 95, 92, 80, 120, 95] as const

function parseStringArray(value: unknown, fallback: ReadonlyArray<string>): string[] {
  if (typeof value !== "string" || value === "") return [...fallback]
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) return parsed
  } catch {
    // fall through to fallback
  }
  return [...fallback]
}

function parseNumberArray(value: unknown, fallback: ReadonlyArray<number>): number[] {
  if (typeof value !== "string" || value === "") return [...fallback]
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "number")) return parsed
  } catch {
    // fall through to fallback
  }
  return [...fallback]
}

const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({ id: "title", label: "Title", placeholder: "Chart title", defaultValue: "Blood Pressure" }),
  createTextAttribute({ id: "categories", label: "X-Axis Labels (JSON array)", placeholder: '["Jan","Feb","Mar"]', defaultValue: JSON.stringify(defaultCategories) }),
  createTextAttribute({ id: "series-a-label", label: "Series A Label", placeholder: "Systolic", defaultValue: "Systolic" }),
  createColorAttribute({ id: "series-a-color", label: "Series A Color", defaultValue: "#ec4899" }),
  createTextAttribute({ id: "series-a-values", label: "Series A Values (JSON array)", placeholder: "[120,130,140]", defaultValue: JSON.stringify(defaultSeriesAValues) }),
  createTextAttribute({ id: "series-b-label", label: "Series B Label", placeholder: "Diastolic", defaultValue: "Diastolic" }),
  createColorAttribute({ id: "series-b-color", label: "Series B Color", defaultValue: "#8b5cf6" }),
  createTextAttribute({ id: "series-b-values", label: "Series B Values (JSON array)", placeholder: "[80,85,90]", defaultValue: JSON.stringify(defaultSeriesBValues) }),
  createTextAttribute({ id: "y-min", label: "Y Axis Min", placeholder: "60", defaultValue: "60" }),
  createTextAttribute({ id: "y-max", label: "Y Axis Max", placeholder: "180", defaultValue: "180" }),
]

const attributesMap = createAttributeMap(attributes)
const Icon = <Activity className="size-4" />

const WIDTH = 640
const HEIGHT = 220
const PADDING_LEFT = 36
const PADDING_RIGHT = 10
const PADDING_TOP = 10
const PADDING_BOTTOM = 24
const GRID_LINE_COUNT = 4

const Component = (props: Props) => {
  const nodeAttributes = props.component.attributes
  const title = nodeAttributes.title || attributesMap.title.defaultValue
  const categories = parseStringArray(nodeAttributes.categories, defaultCategories)
  const seriesALabel = nodeAttributes["series-a-label"] || attributesMap["series-a-label"].defaultValue
  const seriesAColor = nodeAttributes["series-a-color"] || (attributesMap["series-a-color"].defaultValue as string)
  const seriesAValues = parseNumberArray(nodeAttributes["series-a-values"], defaultSeriesAValues)
  const seriesBLabel = nodeAttributes["series-b-label"] || attributesMap["series-b-label"].defaultValue
  const seriesBColor = nodeAttributes["series-b-color"] || (attributesMap["series-b-color"].defaultValue as string)
  const seriesBValues = parseNumberArray(nodeAttributes["series-b-values"], defaultSeriesBValues)
  const yMin = Number(nodeAttributes["y-min"] || attributesMap["y-min"].defaultValue)
  const yMax = Number(nodeAttributes["y-max"] || attributesMap["y-max"].defaultValue)
  const customClasses = readCustomClasses(props.component.attributes)

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const stepX = categories.length > 1 ? plotWidth / (categories.length - 1) : 0

  const toPoint = (value: number, index: number): readonly [number, number] => {
    const ratio = yMax === yMin ? 0 : (value - yMin) / (yMax - yMin)
    const x = PADDING_LEFT + stepX * index
    const y = PADDING_TOP + plotHeight - ratio * plotHeight
    return [x, y]
  }

  const buildPath = (values: ReadonlyArray<number>) =>
    values
      .map((value, index) => toPoint(value, index))
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ")

  const gridLines = Array.from({ length: GRID_LINE_COUNT + 1 }, (_, index) => {
    const value = yMin + ((yMax - yMin) * index) / GRID_LINE_COUNT
    const y = PADDING_TOP + plotHeight - (index / GRID_LINE_COUNT) * plotHeight
    return { value: Math.round(value), y }
  })

  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-sm", customClasses, props.childClassName)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title as React.ReactNode}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: seriesAColor }} />
            {seriesALabel as React.ReactNode}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: seriesBColor }} />
            {seriesBLabel as React.ReactNode}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={String(title)}>
        {gridLines.map((line) => (
          <g key={`grid-${line.value}-${line.y}`}>
            <line x1={PADDING_LEFT} x2={WIDTH - PADDING_RIGHT} y1={line.y} y2={line.y} stroke="currentColor" className="text-border" strokeWidth={1} />
            <text x={PADDING_LEFT - 8} y={line.y + 4} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: 10 }}>
              {line.value}
            </text>
          </g>
        ))}
        {categories.map((category, index) => {
          const [x] = toPoint(0, index)
          return (
            <text key={category} x={x} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
              {category}
            </text>
          )
        })}
        <path d={buildPath(seriesAValues)} fill="none" stroke={seriesAColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={buildPath(seriesBValues)} fill="none" stroke={seriesBColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {seriesAValues.map((value, index) => {
          const [x, y] = toPoint(value, index)
          return <circle key={`a-${index}`} cx={x} cy={y} r={4} fill={seriesAColor} />
        })}
        {seriesBValues.map((value, index) => {
          const [x, y] = toPoint(value, index)
          return <circle key={`b-${index}`} cx={x} cy={y} r={4} fill={seriesBColor} />
        })}
      </svg>
    </section>
  )
}

export const componentMetadata = {
  tag,
  htmlTag: "section",
  label,
  keywords,
  defaultChildren: [],
  attributes,
  Icon,
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata
