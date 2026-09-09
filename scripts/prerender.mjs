// Genera un archivo HTML por ruta con las etiquetas de SEO ya escritas adentro.
//
// Por qué hace falta: Google ejecuta JavaScript y ve las etiquetas que pone
// React, pero los robots de LinkedIn, WhatsApp y Facebook no. Ellos leen el HTML
// crudo y se van. Sin esto, un enlace compartido aparece sin foto ni título.
//
// Por qué no usa un navegador headless: para que la vista previa funcione solo
// hacen falta las etiquetas del <head>, no el HTML de la página renderizada.
// Inyectarlas es suficiente y evita bajar ~300 MB de Chromium en cada build.
// React igual reemplaza todo cuando arranca, así que el visitante no nota nada.
//
// Corre después de `vite build` y trabaja sobre dist/.
import fs from "node:fs"
import path from "node:path"
import PAGINAS from "../src/shared/seo/paginas.json" with { type: "json" }

const DIST = "dist"
const SITIO = process.env.PUBLIC_SITE_URL ?? "https://petrogassa.com"
const API = process.env.VITE_API_URL
const NOMBRE = "Petrogas S.A"

// Las comillas y los signos de HTML dentro de una descripción romperían el
// atributo y podrían inyectar etiquetas. Se escapan siempre.
const esc = (texto) =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const etiquetas = ({ titulo, descripcion, url, imagen, tipo = "website" }) => {
  const t = titulo.includes(NOMBRE) ? titulo : `${titulo} | ${NOMBRE}`
  return `
    <title>${esc(t)}</title>
    <meta name="description" content="${esc(descripcion)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:site_name" content="${NOMBRE}" />
    <meta property="og:type" content="${tipo}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:title" content="${esc(t)}" />
    <meta property="og:description" content="${esc(descripcion)}" />
    <meta property="og:image" content="${esc(imagen)}" />
    <meta property="og:locale" content="es_AR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(t)}" />
    <meta name="twitter:description" content="${esc(descripcion)}" />
    <meta name="twitter:image" content="${esc(imagen)}" />`
}

// La plantilla se limpia antes de usarla. El script escribe sobre el mismo
// dist/index.html que lee, así que al correrlo dos veces sin recompilar la
// plantilla ya venía con las etiquetas de la portada y se apilaban con las de la
// página siguiente. Quedaban dos <title> y Google usa el primero: todas las
// páginas de detalle terminaban con el título de la portada. Es un error mudo
// (el navegador muestra el correcto), así que conviene que no pueda ocurrir.
const limpiar = (html) =>
  html
    .replace(/\s*<title>[\s\S]*?<\/title>/gi, "")
    .replace(/\s*<meta\s+name="(description|twitter:[^"]*)"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")

const plantilla = limpiar(
  fs.readFileSync(path.join(DIST, "index.html"), "utf8"),
)

// La foto por defecto sale del propio build: Vite le pone un hash al nombre, así
// que hay que buscarla en vez de escribirla a mano.
const camion = fs
  .readdirSync(path.join(DIST, "assets"))
  .find((f) => f.startsWith("camion-lema") && f.endsWith(".webp"))
const IMAGEN_POR_DEFECTO = `${SITIO}/assets/${camion}`

const escribir = (ruta, datos) => {
  const html = plantilla.replace("</head>", `${etiquetas(datos)}\n  </head>`)
  // La raíz pisa el index.html; el resto va en su carpeta, que es donde el
  // try_files de nginx lo va a buscar al pedir esa dirección.
  const destino =
    ruta === "/"
      ? path.join(DIST, "index.html")
      : path.join(DIST, ruta, "index.html")
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  fs.writeFileSync(destino, html)
}

let generadas = 0
for (const [ruta, { titulo, descripcion }] of Object.entries(PAGINAS)) {
  escribir(ruta, {
    titulo,
    descripcion,
    url: `${SITIO}${ruta}`,
    imagen: IMAGEN_POR_DEFECTO,
  })
  generadas++
}
console.log(`prerenderizadas ${generadas} páginas fijas`)

// Las de detalle salen de la base. Son las que más importan acá: una nota
// compartida en LinkedIn es el caso de uso concreto. Si la API no responde el
// build NO falla: se pierde la vista previa de esas páginas, no el despliegue.
const traer = async (recurso) => {
  const respuesta = await fetch(`${API}/${recurso}`)
  if (!respuesta.ok) throw new Error(`${recurso} respondió ${respuesta.status}`)
  const cuerpo = await respuesta.json()
  // El backend envuelve todo en {success, data}. Las listas paginadas traen el
  // arreglo adentro de data.data.
  const datos = cuerpo.data
  return Array.isArray(datos) ? datos : (datos?.data ?? [])
}

if (!API) {
  console.log("sin VITE_API_URL: no se prerenderizan servicios ni notas")
} else {
  try {
    const servicios = await traer("services")
    for (const s of servicios) {
      escribir(`/servicios/${s.slug}`, {
        titulo: s.title,
        descripcion: s.shortDescription,
        url: `${SITIO}/servicios/${s.slug}`,
        imagen: s.cardImage ?? IMAGEN_POR_DEFECTO,
      })
    }

    const notas = await traer("news")
    for (const n of notas) {
      escribir(`/novedades-y-prensa/${n.slug}`, {
        titulo: n.title,
        descripcion: n.excerpt,
        url: `${SITIO}/novedades-y-prensa/${n.slug}`,
        imagen: n.coverImage ?? IMAGEN_POR_DEFECTO,
        tipo: "article",
      })
    }
    console.log(
      `prerenderizados ${servicios.length} servicios y ${notas.length} notas`,
    )
  } catch (error) {
    console.warn(`AVISO: no se pudo leer la API (${error.message}).`)
    console.warn("Las páginas de detalle quedan sin vista previa al compartir.")
  }
}
