// Reads the chat text out of the file someone picked: a .txt as it is (Android), or the
// first .txt inside a .zip (iPhone exports the chat zipped).

const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes)

export async function readExport(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    return decode(bytes) // not a zip
  }

  const view = new DataView(bytes.buffer)
  let end = bytes.length - 22 // the directory of a zip sits at its end
  while (end >= 0 && view.getUint32(end, true) !== 0x06054b50) {
    end -= 1
  }
  if (end < 0) {
    throw new Error("het zip-bestand is beschadigd")
  }

  let entry = view.getUint32(end + 16, true)
  for (let i = view.getUint16(end + 10, true); i > 0; i -= 1) {
    const method = view.getUint16(entry + 10, true)
    const size = view.getUint32(entry + 20, true)
    const nameLength = view.getUint16(entry + 28, true)
    const name = decode(bytes.subarray(entry + 46, entry + 46 + nameLength))
    if (/\.txt$/i.test(name)) {
      const local = view.getUint32(entry + 42, true)
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
      const packed = bytes.subarray(start, start + size)
      if (method === 0) {
        return decode(packed)
      }
      if (method !== 8) {
        throw new Error("het zip-bestand is op een onbekende manier ingepakt")
      }
      const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream("deflate-raw"))
      return new Response(stream).text()
    }
    entry += 46 + nameLength + view.getUint16(entry + 30, true) + view.getUint16(entry + 32, true)
  }
  throw new Error("er zit geen tekstbestand in het zip-bestand")
}
