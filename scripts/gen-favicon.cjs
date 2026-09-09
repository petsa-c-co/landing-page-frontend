const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const src = path.join(__dirname, "..", "src", "assets", "logo_2-removebg-preview.png")
const outDir = path.join(__dirname, "..", "public")

// El lockup completo (símbolo + "Petrogas S.A" + bajada) es ilegible a 32 px,
// así que el favicon usa solo el símbolo. El análisis del canal alfa ubicó el
// hueco entre el símbolo y el texto en y=268.
const SYMBOL_TOP = 52
const SYMBOL_BOTTOM = 267

;(async () => {
  const source = await sharp(src).metadata()
  // Recorte y trim en dos pasadas: encadenarlos confunde a libvips.
  const band = await sharp(src)
    .extract({
      left: 0,
      top: SYMBOL_TOP,
      width: source.width,
      height: SYMBOL_BOTTOM - SYMBOL_TOP,
    })
    .png()
    .toBuffer()
  // Saca el aire transparente de los costados.
  const symbol = await sharp(band).trim().png().toBuffer()

  const { width, height } = await sharp(symbol).metadata()
  const side = Math.max(width, height)
  const pad = Math.round(side * 0.08) // respiro para que no toque los bordes
  const canvas = side + pad * 2

  // Cuadrado transparente con el símbolo centrado; de ahí salen los tamaños.
  const squared = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: symbol, gravity: "center" }])
    .png()
    .toBuffer()

  const targets = [
    ["favicon-16x16.png", 16],
    ["favicon-32x32.png", 32],
    ["favicon-48x48.png", 48],
    ["apple-touch-icon.png", 180],
  ]
  for (const [name, size] of targets) {
    await sharp(squared)
      .resize(size, size, { kernel: "lanczos3" })
      .png()
      .toFile(path.join(outDir, name))
  }

  console.log(
    JSON.stringify({
      simbolo: { width, height },
      generados: targets.map(([name]) => ({
        name,
        kb: +(fs.statSync(path.join(outDir, name)).size / 1024).toFixed(1),
      })),
    }),
  )
})()
