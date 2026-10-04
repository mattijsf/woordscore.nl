import type { ChangeEvent } from "react"
import { useState } from "react"
import type { Aliases } from "../../lib/api.ts"
import { readExport } from "../../lib/export-file.ts"
import { ni } from "../../lib/format.ts"
import { messageOf } from "../../lib/messages.ts"
import { guessName, players, underPlayer } from "../../lib/players.ts"
import type { Pending, Review } from "../../lib/upload.ts"
import { MIN_TO_START, review, scores } from "../../lib/upload.ts"
import { parseChat } from "../../lib/whatsapp.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"

interface Upload {
  pending: Pending | null
  links: Aliases
  setLinks: (links: Aliases) => void
  /** the name a new scoreboard gets */
  groupName: string
  setGroupName: (name: string) => void
  /** what the section says under the button */
  status: string
  canConfirm: boolean
  confirmLabel: string
  choose: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  confirm: () => Promise<void>
}

/**
 * Takes the scores out of a chosen export: to start a scoreboard under a free code, or to add to
 * the one on show. Names the scoreboard does not know are asked about first.
 */
export function useUpload(): Upload {
  const code = useBoardStore(state => state.code)
  const starting = useBoardStore(state => state.mode === "new")
  const rows = useBoardStore(state => state.rows)
  const aliases = useBoardStore(state => state.aliases)
  const startScoreboard = useBoardStore(state => state.startScoreboard)
  const keepScores = useBoardStore(state => state.keepScores)
  const [pending, setPending] = useState<Pending | null>(null)
  const [links, setLinks] = useState<Aliases>({})
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)
  const [groupName, setGroupName] = useState("")

  // with names to link, the numbers follow the links chosen so far
  const checked: Review | null =
    pending && !pending.starting ? review(pending.found, pending.skipped, links, rows) : null
  const canConfirm =
    pending?.starting ?? ((checked?.added ?? 0) > 0 || Object.keys(links).length > 0)
  let confirmLabel = "Koppeling bewaren"
  if (starting) {
    confirmLabel = "Scorebord beginnen"
  } else if (checked?.added) {
    confirmLabel = "Stand bijwerken"
  }

  const choose = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ""
    setPending(null)
    setLinks({})
    if (!file) {
      return
    }
    try {
      const found = parseChat(await readExport(file))
      const skipped = !found.ignored
        ? ""
        : ` ${found.ignored === 1 ? "Eén uitslag is" : `${ni(found.ignored)} uitslagen zijn`} overgeslagen: de vakjes passen niet bij de score, de datum klopt niet of de afzender heeft geen naam.`
      if (!found.rows.length) {
        setStatus(`Geen Woordle-scores gevonden in dit bestand.${skipped}`)
      } else if (starting && found.rows.length < MIN_TO_START) {
        setStatus(
          `Er zijn minstens ${MIN_TO_START} scores nodig om een scorebord te beginnen. In dit bestand staat er ${found.rows.length}.`
        )
      } else if (starting) {
        const names = players(found.rows)
        const numbers = found.rows.map(row => row.puzzle)
        setPending({ starting: true, rows: found.rows })
        if (!groupName) {
          setGroupName(guessName(file.name))
        }
        setStatus(
          `${scores(found.rows.length)} gevonden van ${names.length} ${names.length === 1 ? "speler" : "spelers"} (${names.join(", ")}), puzzel ${Math.min(...numbers)} tot en met ${Math.max(...numbers)}.${skipped}`
        )
      } else {
        const known = new Set(players(rows))
        const mine = underPlayer(found.rows, aliases)
        const strangers = players(mine).filter(name => !known.has(name))
        setPending({ starting: false, found: mine, skipped, strangers })
      }
    } catch (error) {
      setStatus(`Dit bestand kon niet gelezen worden: ${messageOf(error)}.`)
    }
  }

  const confirm = async (): Promise<void> => {
    if (!pending) {
      return
    }
    if (pending.starting) {
      setBusy(true)
      try {
        await startScoreboard(pending.rows, groupName.trim() || code)
        setPending(null)
        setStatus("")
        scrollTo(0, 0)
      } catch (error) {
        setStatus(`Het scorebord beginnen lukte niet: ${messageOf(error)}.`)
      } finally {
        setBusy(false)
      }
      return
    }
    if (!checked) {
      return
    }
    const { added } = checked
    setPending(null)
    setLinks({})
    try {
      const last = await keepScores(checked.rows, links)
      setStatus(
        added
          ? `${scores(added, "nieuwe ")} bewaard. Iedereen ziet nu de stand tot en met puzzel ${last}.`
          : "De koppeling is bewaard."
      )
    } catch (error) {
      setStatus(
        `Bewaren lukte niet: ${messageOf(error)}. Als je de pagina opnieuw laadt, is de oude stand terug.`
      )
    }
  }

  return {
    pending,
    links,
    setLinks,
    groupName,
    setGroupName,
    status: checked?.message ?? status,
    canConfirm: canConfirm && !busy,
    confirmLabel,
    choose,
    confirm,
  }
}
