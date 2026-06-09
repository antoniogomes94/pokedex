/**
 * Gera os ícones PNG do PWA (pokébola) sem dependências externas:
 * desenha por pixel e codifica o PNG manualmente com zlib.
 *
 * Uso: node scripts/make-icons.mjs
 */
import { writeFile } from 'node:fs/promises'
import { deflateSync } from 'node:zlib'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const COLORS = {
  red: [227, 53, 13],
  dark: [29, 35, 48],
  light: [244, 244, 244],
  white: [255, 255, 255],
}

function drawPokeball(size) {
  const px = new Uint8Array(size * size * 4)
  const c = size / 2
  const R = size * 0.46
  const band = size * 0.04
  const innerR = size * 0.14
  const innerStroke = size * 0.03

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c
      const dy = y + 0.5 - c
      const d = Math.hypot(dx, dy)
      let color = null
      if (d <= R) {
        if (d > R - band * 1.5) color = COLORS.dark
        else if (d <= innerR) color = COLORS.white
        else if (d <= innerR + innerStroke) color = COLORS.dark
        else if (Math.abs(dy) <= band) color = COLORS.dark
        else color = dy < 0 ? COLORS.red : COLORS.light
      }
      if (color) {
        const i = (y * size + x) * 4
        px[i] = color[0]
        px[i + 1] = color[1]
        px[i + 2] = color[2]
        px[i + 3] = 255
      }
    }
  }
  return px
}

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(px, size) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filtro none
    Buffer.from(px.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const png = encodePng(drawPokeball(size), size)
  const file = path.join(ROOT, 'public', `pwa-${size}.png`)
  await writeFile(file, png)
  console.log(`gerado ${file} (${png.length} bytes)`)
}
