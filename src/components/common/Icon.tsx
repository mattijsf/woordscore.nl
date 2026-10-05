// The icons on the page. They come from Lucide (lucide.dev, ISC licence) and are drawn in the
// colour of the text around them.
import type { LucideIcon } from "lucide-react"
import {
  ArrowDown,
  ArrowUp,
  Brain,
  CalendarCheck,
  ChartLine,
  ChevronLeft,
  Clover,
  Copy,
  Equal,
  Flame,
  Frown,
  Hourglass,
  Info,
  Link,
  ListOrdered,
  Moon,
  Mountain,
  Pencil,
  Ruler,
  Share2,
  ShieldCheck,
  Snowflake,
  Star,
  Sunrise,
  Swords,
  Target,
  Trash2,
  TreePalm,
  Trophy,
  Upload,
  X,
  Zap,
} from "lucide-react"

const DRAWINGS = {
  "arrow-down": ArrowDown,
  "arrow-up": ArrowUp,
  brain: Brain,
  "calendar-check": CalendarCheck,
  "chart-line": ChartLine,
  "chevron-left": ChevronLeft,
  clover: Clover,
  copy: Copy,
  equal: Equal,
  flame: Flame,
  frown: Frown,
  hourglass: Hourglass,
  info: Info,
  link: Link,
  "list-ordered": ListOrdered,
  moon: Moon,
  mountain: Mountain,
  pencil: Pencil,
  ruler: Ruler,
  share: Share2,
  "shield-check": ShieldCheck,
  snowflake: Snowflake,
  star: Star,
  sunrise: Sunrise,
  swords: Swords,
  target: Target,
  trash: Trash2,
  "tree-palm": TreePalm,
  trophy: Trophy,
  upload: Upload,
  x: X,
  zap: Zap,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof DRAWINGS

/** An icon in the text, sized by the stylesheet. */
export function Icon({ name }: { name: IconName }): React.JSX.Element {
  const Drawing = DRAWINGS[name]
  return <Drawing className="icon" aria-hidden="true" />
}

/** An icon in a slot of its own before a label, as on a button. */
export function IconSlot({ name }: { name: IconName }): React.JSX.Element {
  return (
    <span data-icon={name}>
      <Icon name={name} />
    </span>
  )
}
