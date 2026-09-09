// Grafito, no navy: el header, el footer y el hero ya son azules, y sumar
// banners azules dejaba el sitio entero de un solo color. Este gris frío
// industrial da respiro y hace que el azul de la marca resalte.
const GRAPHITE_MID = "#3a4250"
const GRAPHITE_DEEP = "#171b23"
// Reflejo cálido, en la línea del atardecer de la foto del hero.
const WARM_GLOW = "#f2a900" // amber-500

// Hash estable del identificador de la sección: la misma sección siempre
// recibe el mismo fondo entre recargas.
const hashSeed = (seed: string): number => {
  let hash = 0
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return hash
}

// Fondo provisional mientras el CMS no tenga cargada la imagen real. Antes esto
// traía una foto de stock al azar (picsum), que quedaba fuera de contexto en un
// sitio corporativo; ahora es un degradado de la paleta de Petrogas, que se lee
// como una decisión de diseño y no como un error. Se genera en SVG embebido: no
// pesa nada y no depende de ningún servidor externo.
export const placeholder = (seed: string, width = 800, height = 600): string => {
  // El brillo celeste se corre según la sección, así varias tarjetas sin foto
  // no quedan calcadas.
  const glowX = (0.15 + ((hashSeed(seed) % 70) / 100)).toFixed(2)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<defs>` +
    `<linearGradient id="b" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${GRAPHITE_MID}"/>` +
    `<stop offset="1" stop-color="${GRAPHITE_DEEP}"/>` +
    `</linearGradient>` +
    `<radialGradient id="g" cx="${glowX}" cy="0.3" r="0.7">` +
    `<stop offset="0" stop-color="${WARM_GLOW}" stop-opacity=".16"/>` +
    `<stop offset="1" stop-color="${WARM_GLOW}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width="100%" height="100%" fill="url(#b)"/>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>` +
    `</svg>`
  // encodeURIComponent escapa las comillas dobles y los #, pero deja pasar los
  // paréntesis: se codifican aparte para que el valor sea válido dentro de un
  // url() aunque quien lo use no lo encierre entre comillas.
  const encoded = encodeURIComponent(svg)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
  return `data:image/svg+xml,${encoded}`
}

// Antes vivía acá un `imageOr(image, seed)` que elegía entre la foto y el
// degradado. Quedó obsoleto: solo miraba si el campo era null, y una clave
// puede estar viva con el archivo perdido. Ahora eso lo resuelve <Backdrop>,
// que además prueba que la url cargue.
