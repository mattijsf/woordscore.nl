// Shared by the tests: small builders for the two kinds of input the site reads.
import { deflateRawSync } from "node:zlib"

const HEADER = "puzzle,date,player,turns,shared,grid"
export const csv = (...lines: string[]): string => `${[HEADER, ...lines].join("\n")}\n`

const SQUARES: Record<string, string> = { G: "🟩", Y: "🟨", "-": "⬛" }
/** A WhatsApp message with a shared score: head is everything before the text, grid as "--Y--/GGGGG". */
export const shared = (
  head: string,
  puzzle: number,
  turns: number | string,
  grid: string
): string =>
  `${head}Woordle ${puzzle} ${turns}/6\n\n${grid
    .split("/")
    .map(row => Array.from(row, c => SQUARES[c] ?? "").join(""))
    .join("\n")}`

/** The value, or a failed test when there is none. */
export function must<T>(value: T | null | undefined, what = "value"): T {
  if (value === null || value === undefined) {
    throw new Error(`no ${what}`)
  }
  return value
}

/** A zip file holding the given [name, text] entries, stored or deflated. */
export function zip(entries: [string, string][], { deflate = false } = {}): Blob {
  const parts: Buffer[] = []
  const directory: Buffer[] = []
  let offset = 0
  for (const [name, text] of entries) {
    const nameBytes = Buffer.from(name)
    const raw = Buffer.from(text)
    const data = deflate ? deflateRawSync(raw) : raw
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(deflate ? 8 : 0, 8)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(deflate ? 8 : 0, 10)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(raw.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt32LE(offset, 42)
    parts.push(local, nameBytes, data)
    directory.push(central, nameBytes)
    offset += 30 + nameBytes.length + data.length
  }
  const directorySize = directory.reduce((size, part) => size + part.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(directorySize, 12)
  end.writeUInt32LE(offset, 16)
  return new Blob([Buffer.concat([...parts, ...directory, end])])
}
