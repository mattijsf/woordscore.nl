// The scoreboards opened on this device, latest first, so that the start page can offer them.
import { VALID_CODE } from "./code.ts"

const KEY = "woordscore-recent"
const KEPT = 5

interface Visit {
  code: string
  name: string
}

const isVisit = (entry: unknown): entry is Visit =>
  typeof entry === "object" && entry !== null && "code" in entry && typeof entry.code === "string"

const listeners = new Set<() => void>()

/** What is stored, as text; null when nothing is, or nothing can be read. */
function stored(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function parse(text: string | null): Visit[] {
  try {
    const list: unknown = JSON.parse(text ?? "[]")
    return Array.isArray(list) ? list.filter(isVisit) : []
  } catch {
    return []
  }
}

function write(list: Visit[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, KEPT)))
  } catch {
    // private window: nothing is kept
  }
  listeners.forEach(listener => {
    listener()
  })
}

export const recent = {
  stored,
  write,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  add: (code: string, name: string): void => {
    write([{ code, name }, ...parse(stored()).filter(entry => entry.code !== code)])
  },
  forget: (code: string): void => {
    write(parse(stored()).filter(entry => entry.code !== code))
  },
  /** the visits in what is stored that can still be opened */
  shown: (text: string | null): Visit[] => parse(text).filter(entry => VALID_CODE.test(entry.code)),
}
