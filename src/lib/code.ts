// The code of a scoreboard: chosen by its players, and the only lock on it.

export const VALID_CODE = /^[a-z0-9][a-z0-9-]{4,30}[a-z0-9]$/
// What a code may hold, applied while typing: "Familie Tést" -> "familie-test"
const MAX_CODE = 32
export const CODE_RULES = `Een code heeft 6 tot ${MAX_CODE} tekens: kleine letters, cijfers en streepjes.`

/** Capitals, accents and spaces turned into something a code may hold; nothing is lost yet. */
const rewritten = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "-")
export const asTyped = (text: string): string =>
  rewritten(text)
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "")
    .slice(0, MAX_CODE)
export const toCode = (text: string): string => asTyped(text.trim()).replace(/-+$/, "")

/** Whether typing or pasting this would lose characters that a code cannot hold. */
export const losesCharacters = (text: string): boolean =>
  /[^a-z0-9-]/.test(rewritten(text)) || rewritten(text).replace(/[^a-z0-9-]/g, "").length > MAX_CODE
