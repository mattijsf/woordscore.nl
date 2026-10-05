// The file someone picks: a .txt, or a .zip with a .txt in it.
import { describe, expect, it } from "vitest"
import { readExport } from "../src/lib/export-file.ts"
import { zip } from "./helpers.ts"

const CHAT = "03-10-2026 08:50 - Anna: Woordle 1932 3/6\n\n⬛🟨⬛⬛🟨\n"

describe("readExport", () => {
  it("reads a text file as it is", async () => {
    expect(await readExport(new Blob([CHAT]))).toBe(CHAT)
  })

  it("reads the text file out of a zip, stored or compressed", async () => {
    expect(await readExport(zip([["WhatsApp-chat met Woordle.txt", CHAT]]))).toBe(CHAT)
    expect(await readExport(zip([["_chat.txt", CHAT]], { deflate: true }))).toBe(CHAT)
  })

  it("skips other files in the zip", async () => {
    expect(
      await readExport(
        zip(
          [
            ["IMG-0001.jpg", "not a chat"],
            ["_chat.txt", CHAT],
          ],
          { deflate: true }
        )
      )
    ).toBe(CHAT)
  })

  it("says so when the zip holds no text file", async () => {
    await expect(readExport(zip([["IMG-0001.jpg", "x"]]))).rejects.toThrow("geen tekstbestand")
  })
})
