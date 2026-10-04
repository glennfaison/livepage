// Bootstraps the component catalog: imports every definition so its metadata
// registers with `registry-store.ts`, then re-exports the store's lookup API.
// Internal consumers that must not depend on every definition (editor
// controls, container definitions resolving their own children) import
// `registry-store.ts` directly instead of this file; see that module's
// header comment for why.
import { componentMetadata as Header1 } from "./definitions/header1"
import { componentMetadata as Header2 } from "./definitions/header2"
import { componentMetadata as Header3 } from "./definitions/header3"
import { componentMetadata as Paragraph } from "./definitions/paragraph"
import { componentMetadata as InlineText } from "./definitions/inline-text"
import { componentMetadata as Link } from "./definitions/link"
import { componentMetadata as Button } from "./definitions/button"
import { componentMetadata as Image } from "./definitions/image"
import { componentMetadata as Row } from "./definitions/row"
import { componentMetadata as Column } from "./definitions/column"
import { componentMetadata as Badge } from "./definitions/badge"
import { componentMetadata as Divider } from "./definitions/divider"
import { componentMetadata as Callout } from "./definitions/callout"
import { componentMetadata as Stat } from "./definitions/stat"
import { componentMetadata as Time } from "./definitions/time"
import { componentMetadata as Page } from "./definitions/page-component"
import { componentMetadata as LineChart } from "./definitions/line-chart"
import { componentMetadata as MetricCard } from "./definitions/metric-card"
import { componentMetadata as DataTable } from "./definitions/data-table"
import { componentMetadataByTag, registerComponent } from "./registry-store"

export {
  componentMetadataByTag,
  getComponentInfo,
  getComponentsAllowedIn,
  createDesignComponentInstance,
} from "./registry-store"

const allComponentMetadata = [
  Header1, Header2, Header3, Paragraph, InlineText, Link, Button, Image,
  Row, Column, Badge, Divider, Callout, Stat, Time, LineChart, MetricCard,
  DataTable, Page,
]

for (const metadata of allComponentMetadata) {
  registerComponent(metadata)
}
