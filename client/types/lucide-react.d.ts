declare module 'lucide-react' {
  import { ForwardRefExoticComponent, RefAttributes, SVGAttributes } from 'react'
  
  export interface LucideProps extends SVGAttributes<SVGSVGElement> {
    size?: number | string
    absoluteStrokeWidth?: boolean
    strokeWidth?: number | string
    color?: string
  }
  
  export type LucideIcon = ForwardRefExoticComponent<
    RefAttributes<SVGSVGElement> & LucideProps
  >
  
  // All icons used in the codebase
  export const Activity: LucideIcon
  export const AlertCircle: LucideIcon
  export const AlertTriangle: LucideIcon
  export const AlignHorizontalSpaceBetween: LucideIcon
  export const AlignHorizontalSpaceBetweenIcon: LucideIcon
  export const AlignVerticalSpaceBetween: LucideIcon
  export const ArrowDown: LucideIcon
  export const ArrowRight: LucideIcon
  export const ArrowUp: LucideIcon
  export const BlocksIcon: LucideIcon
  export const Bot: LucideIcon
  export const Braces: LucideIcon
  export const Briefcase: LucideIcon
  export const Building2: LucideIcon
  export const Calendar: LucideIcon
  export const Check: LucideIcon
  export const CheckCircle: LucideIcon
  export const CheckIcon: LucideIcon
  export const ChevronDown: LucideIcon
  export const ChevronDownIcon: LucideIcon
  export const ChevronLeft: LucideIcon
  export const ChevronLeftIcon: LucideIcon
  export const ChevronRight: LucideIcon
  export const ChevronUpIcon: LucideIcon
  export const Clock: LucideIcon
  export const Clock3: LucideIcon
  export const Code: LucideIcon
  export const Code2: LucideIcon
  export const Command: LucideIcon
  export const Copy: LucideIcon
  export const CornerDownLeft: LucideIcon
  export const Download: LucideIcon
  export const Droplet: LucideIcon
  export const ExternalLink: LucideIcon
  export const Eye: LucideIcon
  export const FileText: LucideIcon
  export const FileJson: LucideIcon
  export const GraduationCap: LucideIcon
  export const Grid: LucideIcon
  export const GripVertical: LucideIcon
  export const Heading: LucideIcon
  export const Heart: LucideIcon
  export const HeartPulse: LucideIcon
  export const History: LucideIcon
  export const Image: LucideIcon
  export const ImageIcon: LucideIcon
  export const Info: LucideIcon
  export const Keyboard: LucideIcon
  export const Layers: LucideIcon
  export const Layers3: LucideIcon
  export const LayoutDashboard: LucideIcon
  export const LayoutTemplate: LucideIcon
  export const Link: LucideIcon
  export const Linkedin: LucideIcon
  export const List: LucideIcon
  export const Loader2: LucideIcon
  export const LoaderIcon: LucideIcon
  export const Mail: LucideIcon
  export const Maximize: LucideIcon
  export const Megaphone: LucideIcon
  export const MessageCircle: LucideIcon
  export const Mic: LucideIcon
  export const Minimize: LucideIcon
  export const Minus: LucideIcon
  export const Monitor: LucideIcon
  export const MonitorPlay: LucideIcon
  export const Moon: LucideIcon
  export const MousePointer2: LucideIcon
  export const MousePointerClick: LucideIcon
  export const Move: LucideIcon
  export const Network: LucideIcon
  export const Newspaper: LucideIcon
  export const Palette: LucideIcon
  export const Pencil: LucideIcon
  export const Plug: LucideIcon
  export const PlugZapIcon: LucideIcon
  export const Plus: LucideIcon
  export const Redo: LucideIcon
  export const Redo2: LucideIcon
  export const RefreshCw: LucideIcon
  export const Replace: LucideIcon
  export const RotateCcw: LucideIcon
  export const RotateCw: LucideIcon
  export const Rss: LucideIcon
  export const Save: LucideIcon
  export const Search: LucideIcon
  export const Send: LucideIcon
  export const Settings: LucideIcon
  export const SettingsIcon: LucideIcon
  export const Sparkles: LucideIcon
  export const Star: LucideIcon
  export const Sun: LucideIcon
  export const Table2: LucideIcon
  export const Tag: LucideIcon
  export const Thermometer: LucideIcon
  export const Trash2: LucideIcon
  export const TrendingUp: LucideIcon
  export const Type: LucideIcon
  export const Undo: LucideIcon
  export const Undo2: LucideIcon
  export const Upload: LucideIcon
  export const User: LucideIcon
  export const Utensils: LucideIcon
  export const WandSparkles: LucideIcon
  export const WifiOff: LucideIcon
  export const Wind: LucideIcon
  export const X: LucideIcon
  
  export default LucideIcon
}