/**
 * Revisión del sitio, al pie.
 *
 * Se edita a mano, igual que la de cualquier documento del sistema de gestión
 * ("Rev. 14 - Ene. 2025" del manual de Bureau Veritas). No sale de
 * package.json ni de la fecha de compilación a propósito: una revisión la
 * decide una persona cuando el contenido cambia, no cada vez que se sube un
 * arreglo de CSS.
 *
 * Al publicar un cambio de contenido: subir el número y actualizar la fecha.
 */
export const SITE_REVISION = {
  numero: "00",
  fecha: "Ago. 2026",
} as const

/**
 * Fecha de la última revisión del AVISO DE PRIVACIDAD.
 *
 * Va aparte de SITE_REVISION a propósito, aunque hasta ahora compartían valor.
 * La revisión del sitio pasó a subir sola, una por cada día en que se cambia
 * cualquier contenido; atar el aviso a ese número lo haría decir "actualizado
 * hoy" cada vez que alguien corrige una descripción de un servicio. Un aviso
 * legal declara cuándo cambió SU texto, y eso lo decide una persona.
 *
 * Al tocar el texto del aviso: actualizar esta fecha, y solo esta.
 */
export const PRIVACIDAD_REVISION = {
  // Sin punto, igual que la revisión del sitio: control de documentos pidió
  // esa forma y dos numeraciones distintas en el mismo sitio se leen como un
  // error.
  numero: "01",
  fecha: "Ago. 2026",
} as const

export const SITE_INFO = {
  name: "Petrogas S.A.",
  address: "Chubut 850, Cutral-Có, Neuquén",
  phones: "299-5573812 / 299-4960901",
  email: "petrogas@petrogassa.com",
  // Coordenadas exactas de Chubut 850 en vez del nombre de la ciudad: con
  // "Cutral-Có" a secas el mapa salía alejado y el pin caía en cualquier lado.
  // `z=17` deja la cuadra a la vista y `hl=es` fuerza los rótulos en español.
  mapEmbedUrl:
    "https://www.google.com/maps?q=-38.933428%2C-69.216268&z=17&hl=es&output=embed",
} as const

// Los servicios los administra el CMS: el submenú se arma con lo que devuelve
// GET /services, no con una lista fija (los slugs cambiarían al editarlos).
export const NAV_ITEMS = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/servicios", label: "Servicios", hasServicesMenu: true },
  { to: "/certificaciones", label: "Certificaciones" },
  { to: "/rrhh", label: "R.R.H.H." },
  // Se esconde del menú mientras no haya ninguna nota publicada (ver
  // useHayNovedades). La ruta sigue existiendo: quien tenga el enlace guardado
  // llega igual y encuentra el aviso de que todavía no hay nada, que es mejor
  // que un 404.
  { to: "/novedades-y-prensa", label: "Novedades y Prensa", soloConNovedades: true },
  { to: "/contacto", label: "Contacto" },
] as const
