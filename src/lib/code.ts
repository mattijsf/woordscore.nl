// The code of a scoreboard: chosen by its players, and the only lock on it.

export const VALID_CODE = /^[a-z0-9][a-z0-9-]{4,30}[a-z0-9]$/
export const CODE_RULES = "Een code heeft 6 tot 32 tekens: letters, cijfers en streepjes."
/** "Familie Jansen" -> "familie-jansen" */
export const toCode = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
