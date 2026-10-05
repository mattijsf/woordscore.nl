import type { ChangeEvent } from "react"
import { useState } from "react"
import { readExport } from "../../lib/export-file.ts"
import { ni } from "../../lib/format.ts"
import { messageOf } from "../../lib/messages.ts"
import { guessName, players, underPlayer } from "../../lib/players.ts"
import type { NameChoice, Pending, Review } from "../../lib/upload.ts"
import { MIN_TO_START, review, scores } from "../../lib/upload.ts"
import { parseChat } from "../../lib/whatsapp.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"

interface Upload {
  pending: Pending | null
  choices: Record<string, NameChoice>
  setChoice: (name: string, choice: NameChoice) => void
  /** the name a new scoreboard gets */
  title: string
  setTitle: (title: string) => void
  /** what the section says under the button */
  status: string
  /** why the confirm button is off, when a chosen name cannot be used */
  refused: string
  canConfirm: boolean
  confirmLabel: string
  choose: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  confirm: () => Promise<void>
}

/**
 * Takes the scores out of a chosen export: to start a scoreboard under a free code, or to add to
 * the one on show. Each name gets a question first: every name when a scoreboard starts, else
 * the names it does not know. The answers are kept, so the question comes only once.
 */
export function useUpload(): Upload {
  const code = useBoardStore(state => state.code)
  const starting = useBoardStore(state => state.mode === "new")
  const rows = useBoardStore(state => state.rows)
  const aliases = useBoardStore(state => state.aliases)
  const startScoreboard = useBoardStore(state => state.startScoreboard)
  const keepScores = useBoardStore(state => state.keepScores)
  const [pending, setPending] = useState<Pending | null>(null)
  const [choices, setChoices] = useState<Record<string, NameChoice>>({})
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)

  // the numbers follow the names chosen so far
  let checked: Review | null = null
  let refused = ""
  if (pending) {
    try {
      checked = review(pending, choices, rows, starting)
    } catch (error) {
      // cannot happen while names are cleaned as they are typed; if it does, say why the button is off
      refused = messageOf(error)
    }
  }
  let canConfirm = false
  let confirmLabel = "Stand bijwerken"
  if (pending && starting) {
    canConfirm = (checked?.rows.length ?? MIN_TO_START) >= MIN_TO_START
    confirmLabel = "Scorebord beginnen"
  } else if (pending) {
    canConfirm = !checked || checked.added > 0 || Object.keys(checked.links).length > 0
    confirmLabel = checked && !checked.added ? "Koppeling bewaren" : "Stand bijwerken"
  }

  const choose = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ""
    setPending(null)
    setChoices({})
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
        // the scoreboard is called after the group, which WhatsApp puts in the name of the file
        const name = (guessName(file.name) || code).replace(/[<>&"']/g, "")
        setPending({ found: found.rows, skipped, names: players(found.rows), title: name })
        setTitle(name)
      } else {
        const mine = underPlayer(found.rows, aliases)
        const known = new Set(players(rows))
        const names = players(mine).filter(name => !known.has(name))
        setPending({ found: mine, skipped, names, title: "" })
      }
    } catch (error) {
      setStatus(`Dit bestand kon niet gelezen worden: ${messageOf(error)}.`)
    }
  }

  const confirm = async (): Promise<void> => {
    if (!pending || !checked) {
      return
    }
    const { links, added } = checked
    if (starting) {
      setBusy(true)
      try {
        await startScoreboard(checked.rows, title.trim() || pending.title, links)
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
    setPending(null)
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
    choices,
    setChoice: (name, choice) => {
      setChoices(current => ({ ...current, [name]: choice }))
    },
    title,
    setTitle,
    status: refused === "" ? (checked?.message ?? status) : refused,
    refused,
    canConfirm: canConfirm && !busy,
    confirmLabel,
    choose,
    confirm,
  }
}
