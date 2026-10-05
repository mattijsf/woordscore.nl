// What a player's name may hold, applied while typing, so that a name is never refused afterwards.
const MAX_NAME = 24
export const NAME_RULES = `Een naam heeft hooguit ${MAX_NAME} tekens: letters, cijfers, spaties, streepjes, punten en apostroffen. Andere tekens worden weggelaten.`

export const nameAsTyped = (text: string): string =>
  text
    .replace(/[^\p{L}\p{N} .'’-]/gu, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/ {2,}/g, " ")
    .slice(0, MAX_NAME)
