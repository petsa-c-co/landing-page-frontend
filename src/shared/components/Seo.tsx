import { useLocation } from "react-router"
import imagenPorDefecto from "@/assets/fotos/camion-lema.webp"

// Dominio de producción. Hace falta escrito porque las etiquetas que lee
// Facebook, LinkedIn o WhatsApp exigen URLs absolutas: esos servidores leen el
// HTML desde afuera y una ruta como "/servicios" no les dice nada.
const SITIO = "https://petrogassa.com"
const NOMBRE = "Petrogas S.A"

interface SeoProps {
  // Lo que se ve como enlace azul en el resultado de Google y en la pestaña del
  // navegador. Google recorta alrededor de los 60 caracteres.
  titulo: string
  // El párrafo gris debajo del enlace en Google. No cambia el posicionamiento,
  // pero decide si la persona hace clic o sigue de largo. Se corta cerca de 155.
  descripcion: string
  // La foto que aparece al pegar el enlace en WhatsApp o LinkedIn. Absoluta.
  imagen?: string
  // "article" para las notas, "website" para el resto.
  tipo?: "website" | "article"
}

export const Seo = ({
  titulo,
  descripcion,
  imagen,
  tipo = "website",
}: SeoProps) => {
  const { pathname } = useLocation()
  const url = `${SITIO}${pathname}`
  const foto = imagen ?? `${SITIO}${imagenPorDefecto}`
  // La marca se agrega al final salvo que el título ya la traiga. La portada la
  // pone adelante a propósito: es la página que la gente deja abierta, y en una
  // pestaña angosta solo se leen los primeros ~30 caracteres, así que con la
  // marca al final no se ve de quién es el sitio.
  const tituloCompleto = titulo.includes(NOMBRE) ? titulo : `${titulo} | ${NOMBRE}`

  return (
    <>
      <title>{tituloCompleto}</title>
      <meta name="description" content={descripcion} />
      {/* Le dice a Google cuál es la dirección buena de esta página. Sin esto,
          la misma página abierta con ?utm_source=... cuenta como una página
          distinta y las dos compiten entre sí. */}
      <link rel="canonical" href={url} />

      {/* Open Graph: el formato que leen WhatsApp, LinkedIn y Facebook para
          armar la tarjeta con foto que se ve al pegar un enlace. */}
      <meta property="og:site_name" content={NOMBRE} />
      <meta property="og:type" content={tipo} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={tituloCompleto} />
      <meta property="og:description" content={descripcion} />
      <meta property="og:image" content={foto} />
      <meta property="og:locale" content="es_AR" />

      {/* X/Twitter usa su propio juego de etiquetas. summary_large_image es el
          formato con la foto grande arriba en vez de una miniatura al costado. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={tituloCompleto} />
      <meta name="twitter:description" content={descripcion} />
      <meta name="twitter:image" content={foto} />
    </>
  )
}
