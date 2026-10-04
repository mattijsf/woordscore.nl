/**
 * Copies text to the clipboard. Without clipboard access, as on a plain http address, the text
 * in `field` is selected and copied the old way. Answers whether it worked.
 */
export async function copyText(text: string, field: HTMLInputElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    field?.select()
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the one way left without clipboard access
    return document.execCommand("copy")
  }
}
