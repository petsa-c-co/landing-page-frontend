// Ajusta cada foto del hero al tamaño que realmente ocupa en pantalla.
//
//   pnpm optimizar-fotos
//
// Los anchos salen de la celda donde vive cada foto en HeroSecuencia, medidos
// en pantalla retina (el doble del tamaño en CSS). Poner más que eso es peso
// que nadie ve; poner menos se nota borroso.
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

// Sin esto no se puede reemplazar ninguna foto. sharp deja en caché los
// archivos que lee y en Windows ese mapeo bloquea el archivo: escribir encima
// falla con UNKNOWN y borrarlo con EBUSY, aunque nadie más lo esté usando. Como
// acá cada foto se lee y se reescribe en la misma pasada, el script se bloquea
// a sí mismo. Además el caché devuelve medidas viejas al releer.
sharp.cache(false)

const DIR = "src/assets/fotos"

// OJO con las fotos verticales: NO van acá. Viven en celdas altas y angostas
// (316x772 CSS), y como el navegador usa `cover`, la que manda es la ALTURA, no
// el ancho: la celda necesita 1544 px reales de alto en pantalla retina. Achicar
// una de esas por ancho la deja más baja que eso y el navegador tiene que
// agrandarla, que es justo lo contrario de lo que buscamos. Ya pasó una vez con
// zona-1: bajarla de 900 a 784 de ancho la dejó en 1394 de alto y empezó a
// agrandarse un 11%. Las verticales se dejan como están.
const OBJETIVO = {
  // Cuadros a pantalla completa (~1568 px de ancho en CSS).
  "camion-lema": 2400,
  "flota-yacimiento": 2400,
  // Cuadro mixto, horizontales apiladas: media pantalla => 784 px de ancho, y
  // la celda es apaisada, así que acá sí manda el ancho.
  "zona-2": 1568,
  micros: 1568,
  // Grilla 3×2 => 523 px por celda.
  "capacitacion-1": 1046,
  "capacitacion-2": 1046,
  "rcp-1": 1046,
  "seguridad-1": 1046,
  "camion-grua": 1046,
  "flota-base": 1046,
}

let antes = 0
let despues = 0
let tocadas = 0
const fallos = []

for (const [nombre, ancho] of Object.entries(OBJETIVO)) {
  const archivo = path.join(DIR, `${nombre}.webp`)
  if (!fs.existsSync(archivo)) {
    console.log(`  falta ${nombre}.webp`)
    continue
  }

  const pesoAntes = fs.statSync(archivo).size
  antes += pesoAntes
  const meta = await sharp(archivo).metadata()

  if (meta.width <= ancho) {
    despues += pesoAntes
    console.log(`${nombre.padEnd(18)} ${meta.width}px — ya estaba bien`)
    continue
  }

  // Se resuelve en memoria y se escribe encima del original, sin temporales ni
  // renombres: una vez liberado el caché de sharp, sobreescribir alcanza.
  try {
    const nuevo = await sharp(archivo)
      // Solo se reduce el tamaño y se sube la calidad a 90: bajar ambas cosas
      // a la vez encadena pérdida sobre un WebP que ya venía comprimido.
      .resize({ width: ancho })
      .webp({ quality: 90, effort: 6 })
      .toBuffer()

    const peso = nuevo.length
    // Reencodear un WebP sobre otro WebP siempre pierde algo de calidad, así
    // que solo vale la pena si el ahorro se nota. Cuando la foto ya estaba
    // cerca del tamaño objetivo el archivo nuevo puede salir incluso más
    // pesado: en ese caso se descarta y queda la original intacta.
    if (peso > pesoAntes * 0.9) {
      despues += pesoAntes
      console.log(`${nombre.padEnd(18)} sin cambios — achicarla no compensa`)
      continue
    }

    fs.writeFileSync(archivo, nuevo)
    tocadas++
    despues += peso
    const kb = (n) => String(Math.round(n / 1024)).padStart(4)
    console.log(
      `${nombre.padEnd(18)} ${kb(pesoAntes)} KB -> ${kb(peso)} KB   ${meta.width} -> ${ancho}px`,
    )
  } catch (error) {
    fallos.push(`${nombre} (${error.code})`)
    despues += pesoAntes
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(2)
console.log(`\n${tocadas} redimensionadas · ${mb(antes)} MB -> ${mb(despues)} MB`)
if (fallos.length) {
  console.log(`\nNo se pudieron reemplazar: ${fallos.join(", ")}`)
  console.log("Si dice UNKNOWN o EBUSY, algo tiene el archivo tomado.")
}
