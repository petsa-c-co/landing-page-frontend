import brandBanner from "@/assets/banner.webp";
import oficinas from "@/assets/petrogas-oficinas.webp";
import heroPrimeraFoto from "@/assets/fotos/flota-yacimiento.webp";

// Imágenes de cabecera de las páginas fijas, editables desde el panel
// (FRONTEND.md §3.6.2). El backend NO tiene los slots hardcodeados: el que se
// use, existe. Por eso la lista vive acá y es la fuente única — el panel arma
// sus casilleros con esto y las páginas leen con la misma constante, así un
// typo no crea un slot fantasma que nadie ve.
export const SITE_IMAGE_SLOTS = {
  bannerNosotros: "banner-nosotros",
  bannerServicios: "banner-servicios",
  bannerCertificaciones: "banner-certificaciones",
  // /rrhh y /trabaja-con-nosotros comparten cabecera.
  bannerRrhh: "banner-rrhh",
  bannerNovedades: "banner-novedades",
  bannerContacto: "banner-contacto",
  homeHero: "home-hero",
  homeEmpresa: "home-empresa",
} as const;

export type SiteImageSlot =
  (typeof SITE_IMAGE_SLOTS)[keyof typeof SITE_IMAGE_SLOTS];

// Mapa slot -> URL absoluta. Solo vienen los slots CON imagen cargada: si no
// hay ninguna, el backend devuelve {} (nunca 404).
export type SiteImages = Partial<Record<SiteImageSlot, string>>;

/**
 * La imagen que usa cada lugar cuando NADIE subió nada desde el panel.
 *
 * Vive acá, junto a la lista de slots, por el mismo motivo que las etiquetas:
 * el panel y las páginas tienen que estar mirando el mismo archivo. Antes cada
 * página importaba su default por su cuenta y el panel no sabía cuál era, así
 * que dibujaba un esquema abstracto en vez de mostrar la foto que la página
 * realmente está usando.
 *
 * Los banners comparten la franja de marca. `home-hero` es el único caso raro:
 * la portada rota una secuencia de fotos, así que lo que se lista es la
 * PRIMERA —la que se ve al entrar—, y HeroSecuencia arranca de acá para que no
 * se desincronicen.
 */
export const SITE_IMAGE_DEFAULTS: Record<SiteImageSlot, string> = {
  "home-hero": heroPrimeraFoto,
  "home-empresa": oficinas,
  "banner-nosotros": brandBanner,
  "banner-servicios": brandBanner,
  "banner-certificaciones": brandBanner,
  "banner-rrhh": brandBanner,
  "banner-novedades": brandBanner,
  "banner-contacto": brandBanner,
};

// Medidas sugeridas, sacadas de cómo se renderiza cada lugar (con margen para
// pantallas grandes y retina). No son un límite: el panel reescala lo que se
// suba, pero una foto más chica que esto se va a ver borrosa.
// 4:1 — es la proporción exacta de la franja: así entra completa, sin que se
// recorte nada arriba ni abajo.
const BANNER_SIZE = "1920 × 480 px";

// Etiquetas para la pantalla del panel.
export const SITE_IMAGE_LABELS: Record<
  SiteImageSlot,
  { title: string; hint: string; recommended: string }
> = {
  "home-hero": {
    title: "Inicio — foto principal",
    // En el celular esta franja es casi vertical y recorta muchísimo a los
    // costados, por eso conviene una foto alta (4:3) y no una panorámica.
    hint: "La imagen grande de arriba de todo. Evitá fotos panorámicas: en el celular se recortan mucho",
    recommended: "2560 × 1700 px (una foto de celular sin recortar sirve)",
  },
  "home-empresa": {
    title: "Inicio — bloque “Nuestra empresa”",
    hint: "La foto que acompaña el texto de la historia de Petrogas",
    recommended: "1200 × 800 px",
  },
  "banner-nosotros": {
    title: "Cabecera de Nosotros",
    hint: "Franja con el título, arriba de la página",
    recommended: BANNER_SIZE,
  },
  "banner-servicios": {
    title: "Cabecera de Servicios",
    hint: "Solo el listado; cada servicio tiene su propia imagen al editarlo",
    recommended: BANNER_SIZE,
  },
  "banner-certificaciones": {
    title: "Cabecera de Certificaciones",
    hint: "Franja con el título, arriba de la página",
    recommended: BANNER_SIZE,
  },
  "banner-rrhh": {
    title: "Cabecera de R.R.H.H.",
    hint: "La comparten R.R.H.H. y Trabajá con Nosotros",
    recommended: BANNER_SIZE,
  },
  "banner-novedades": {
    title: "Cabecera de Novedades y Prensa",
    hint: "Solo el listado; cada nota tiene su propia portada",
    recommended: BANNER_SIZE,
  },
  "banner-contacto": {
    title: "Cabecera de Contacto",
    hint: "Franja con el título, arriba de la página",
    recommended: BANNER_SIZE,
  },
};
