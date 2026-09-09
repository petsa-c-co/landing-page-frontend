import { useLocation } from "react-router"
import { Seo } from "./Seo"
import PAGINAS from "../seo/paginas.json"

// Los textos viven en un JSON y no acá porque los lee también el script de
// prerenderizado (scripts/prerender.mjs), que corre en Node después del build y
// no puede importar un módulo de TypeScript. Una sola fuente para los dos.
//
// Las páginas de detalle (un servicio, una nota) no figuran: esas arman su SEO
// con el dato que traen de la API y ponen su propio <Seo>.
const paginas: Record<string, { titulo: string; descripcion: string }> = PAGINAS

// Va montado en el layout público para que cada página fija quede cubierta sin
// tener que tocarla una por una. Las rutas de detalle no están en el mapa y acá
// no se renderiza nada, así que no le pisan el título al que pone la página.
export const SeoDeRuta = () => {
  const { pathname } = useLocation()
  // Se saca la barra final para que "/contacto" y "/contacto/" no se traten
  // como direcciones distintas.
  const ruta = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname
  const pagina = paginas[ruta]

  if (!pagina) return null
  return <Seo titulo={pagina.titulo} descripcion={pagina.descripcion} />
}
