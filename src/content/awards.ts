// What goes with each award in the trophy cabinet.
import type { IconName } from "../components/common/Icon.tsx"

/**
 * The icon of each award, and the colour of the tile it sits on: green for an achievement,
 * yellow for a habit, grey for bad luck.
 */
export const AWARD_ICONS: Record<string, [icon: IconName, tone: string]> = {
  "Langste reeks": ["link", "g"],
  "Meeste dagzeges": ["trophy", "g"],
  "Trouwste speler": ["calendar-check", "g"],
  "Als eerste klaar": ["zap", "g"],
  "Beste opener": ["target", "g"],
  "Beste maand": ["star", "g"],
  "In één keer raak": ["clover", "g"],
  Nachtuil: ["moon", "y"],
  "Vroegste vogel": ["sunrise", "y"],
  "Meest constant": ["ruler", "y"],
  Gedachtenlezers: ["brain", "y"],
  "Op het nippertje": ["hourglass", ""],
  "Op één letter na": ["frown", ""],
  "Koude start": ["snowflake", ""],
  "Langste pauze": ["tree-palm", ""],
}

/** Which tip explains each award in the trophy cabinet. */
export const AWARD_TIPS: Record<string, string> = {
  "Langste reeks": "reeks",
  "Meeste dagzeges": "dagzege",
  "Trouwste speler": "deelname",
  "Als eerste klaar": "eerste",
  "Beste opener": "besteopener",
  Nachtuil: "nachtuil",
  "Vroegste vogel": "vroegstevogel",
  "Op het nippertje": "nippertje",
  "In één keer raak": "raak",
  "Op één letter na": "letter",
  "Koude start": "koudestart",
  "Meest constant": "constant",
  "Beste maand": "bestemaand",
  "Langste pauze": "pauze",
  Gedachtenlezers: "gedachtenlezers",
}
