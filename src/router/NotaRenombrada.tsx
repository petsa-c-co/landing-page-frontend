import { Navigate, useParams } from "react-router"

// El sitio viejo tenía novedades y prensa separadas; ahora son una sola sección
// con filtro por categoría. El slug no cambió, así que alcanza con reescribir el
// prefijo y la persona llega a la misma nota.
//
// OJO: esto es una red de contención, NO reemplaza al 301 del servidor. Acá el
// servidor ya respondió 200 y el salto lo hace JavaScript, así que Google no
// traslada el posicionamiento de la URL vieja. Sirve para que a nadie se le
// rompa un enlace guardado; el traspaso de posicionamiento lo tiene que hacer
// el 301 de verdad, en la configuración del servidor que sirva el sitio.
export const NotaRenombrada = () => {
  const { slug } = useParams()
  return <Navigate to={`/novedades-y-prensa/${slug}`} replace />
}
