import React from "react"
import { Activity, ArrowDown, ArrowUp, Droplet, Heart, Thermometer, Wind } from "lucide-react"
import { withDataSource } from "@/client/features/data-sources"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import type { Metadata, Props, SettingsField } from "@/client/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, createTextAttribute, readCustomClasses, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

const tag = "metric-card" as const
const label = "Metric Card"
const keywords = ["metric", "stat", "vitals", "kpi", "card", "health"]

const iconOptions = ["activity", "heart", "thermometer", "wind", "droplet"] as const
const toneOptions = ["blue", "yellow", "pink", "green", "neutral"] as const
const trendOptions = ["up", "down", "none"] as const

const iconMap: Readonly<Record<(typeof iconOptions)[number], React.ComponentType<{ className?: string }>>> = {
  activity: Activity,
  heart: Heart,
  thermometer: Thermometer,
  wind: Wind,
  droplet: Droplet,
}

const toneClasses: Readonly<Record<(typeof toneOptions)[number], Readonly<{ card: string; iconWrap: string; icon: string }>>> = {
  blue: { card: "bg-sky-50", iconWrap: "bg-white", icon: "text-sky-500" },
  yellow: { card: "bg-amber-50", iconWrap: "bg-white", icon: "text-amber-500" },
  pink: { card: "bg-rose-50", iconWrap: "bg-white", icon: "text-rose-500" },
  green: { card: "bg-emerald-50", iconWrap: "bg-white", icon: "text-emerald-500" },
  neutral: { card: "bg-slate-50", iconWrap: "bg-white", icon: "text-slate-500" },
}

const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createSelectAttribute({ id: "icon", label: "Icon", options: iconOptions, defaultValue: "activity" }),
  createSelectAttribute({ id: "tone", label: "Background", options: toneOptions, defaultValue: "neutral" }),
  createTextAttribute({ id: "value", label: "Value", placeholder: "e.g. 79", defaultValue: "24" }),
  createTextAttribute({ id: "unit", label: "Unit", placeholder: "e.g. bpm", defaultValue: "" }),
  createTextAttribute({ id: "label", label: "Label", placeholder: "e.g. Heart Rate", defaultValue: "Metric" }),
  createSelectAttribute({ id: "trend", label: "Trend", options: trendOptions, defaultValue: "none" }),
  createTextAttribute({ id: "trend-label", label: "Trend Label", placeholder: "e.g. Higher than Average", defaultValue: "Normal" }),
]

const attributesMap = createAttributeMap(attributes)
const Icon = <Activity className="size-4" />

const Component = (props: Props) => {
  const nodeAttributes = props.component.attributes
  const iconKey = (nodeAttributes.icon || attributesMap.icon.defaultValue) as (typeof iconOptions)[number]
  const tone = (nodeAttributes.tone || attributesMap.tone.defaultValue) as (typeof toneOptions)[number]
  const value = nodeAttributes.value || attributesMap.value.defaultValue
  const unit = nodeAttributes.unit ?? attributesMap.unit.defaultValue
  const metricLabel = nodeAttributes.label || attributesMap.label.defaultValue
  const trend = (nodeAttributes.trend || attributesMap.trend.defaultValue) as (typeof trendOptions)[number]
  const trendLabel = nodeAttributes["trend-label"] || attributesMap["trend-label"].defaultValue
  const customClasses = readCustomClasses(props.component.attributes)
  const metadata = getComponentInfo(props.component.tag)
  const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)

  const MetricIcon = iconMap[iconKey] || Activity
  const toneStyle = toneClasses[tone] || toneClasses.neutral
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : null

  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl p-5", toneStyle.card, customClasses, props.childClassName)} {...accessibilityAttrs}>
      <span className={cn("flex size-11 items-center justify-center rounded-full shadow-sm", toneStyle.iconWrap)}>
        <MetricIcon className={cn("size-5", toneStyle.icon)} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{metricLabel as React.ReactNode}</p>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight text-foreground">{value as React.ReactNode}</span>
          {unit ? <span className="text-sm font-medium text-muted-foreground">{unit as React.ReactNode}</span> : null}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {TrendIcon ? <TrendIcon className="size-3.5" aria-hidden="true" /> : null}
          {trendLabel as React.ReactNode}
        </p>
      </div>
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
  category: "Data",
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata
