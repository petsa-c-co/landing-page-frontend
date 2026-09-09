import { Link, isRouteErrorResponse, useRouteError } from "react-router"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Seo } from "@/shared/components/Seo"

interface RouteErrorPageProps {
  // El panel vuelve a /admin y el sitio a la home: mandar a alguien del panel
  // a la landing pública lo saca de donde estaba trabajando.
  area?: "sitio" | "panel"
}

// Texto del error para el detalle técnico. Un Response lanzado por un loader
// trae status; una excepción de render trae message y stack.
const describeError = (error: unknown): string => {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}\n${
      typeof error.data === "string" ? error.data : JSON.stringify(error.data)
    }`
  }
  if (error instanceof Error) return error.stack ?? error.message
  return String(error)
}

/**
 * errorElement de las dos rutas raíz. Va en la ruta padre y no en cada hija a
 * propósito: así también cubre los errores del propio layout, que una frontera
 * más abajo no vería. El costo es que reemplaza el layout entero, por eso esta
 * pantalla trae su propia salida a mano en vez de apoyarse en la navegación.
 *
 * Sin esto, un error de render cae en la pantalla cruda de React Router: en
 * producción es un texto pelado, y en el panel deja al usuario sin sidebar y
 * con una URL de /admin que ya no dibuja nada.
 */
export const RouteErrorPage = ({ area = "sitio" }: RouteErrorPageProps) => {
  const error = useRouteError()
  const esPanel = area === "panel"

  // Recargar y no navegar: después de un error de render, el estado de la
  // frontera queda pegado hasta que se remonta el árbol, así que un Link no
  // siempre alcanza para salir.
  const recargar = () => window.location.reload()

  return (
    <div className="min-h-dvh flex items-center justify-center bg-navy-900 px-4 py-16">
      <Seo
        titulo="Algo salió mal"
        descripcion="Ocurrió un error inesperado."
      />
      <div className="w-full max-w-lg text-center">
        <p className="font-heading text-sky-400 text-sm uppercase tracking-[.2em] mb-3">
          Error inesperado
        </p>
        <h1 className="font-heading uppercase font-bold text-white text-3xl md:text-4xl mb-4">
          Algo salió mal
        </h1>
        <p className="text-navy-300 text-sm mb-8">
          {esPanel
            ? "No pudimos dibujar esta pantalla del panel. Recargá para volver a intentarlo; si sigue igual, avisale a quien mantiene el sitio."
            : "No pudimos mostrar esta página. Recargá para volver a intentarlo."}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={recargar} className="rounded-lg">
            <RotateCcw className="w-4 h-4" />
            Recargar
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link to={esPanel ? "/admin" : "/"}>
              {esPanel ? "Ir al inicio del panel" : "Volver al inicio"}
            </Link>
          </Button>
        </div>

        {/* El detalle solo en desarrollo: en producción no le dice nada a quien
            usa el sitio y puede filtrar rutas y nombres internos. */}
        {import.meta.env.DEV && (
          <pre className="mt-8 max-h-64 overflow-auto rounded-lg bg-navy-950 p-4 text-left text-navy-300 text-xs whitespace-pre-wrap">
            {describeError(error)}
          </pre>
        )}
      </div>
    </div>
  )
}
