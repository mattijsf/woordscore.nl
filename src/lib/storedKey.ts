// The key to remove a scoreboard, kept on the device that made it.
const name = (code: string): string => `woordle-key:${code}`

export const storedKey = {
  get: (code: string): string => {
    try {
      return localStorage.getItem(name(code)) ?? ""
    } catch {
      return ""
    }
  },
  set: (code: string, key: string): void => {
    try {
      localStorage.setItem(name(code), key)
    } catch {
      // private window: it is shown once
    }
  },
  clear: (code: string): void => {
    try {
      localStorage.removeItem(name(code))
    } catch {
      // nothing kept
    }
  },
}
