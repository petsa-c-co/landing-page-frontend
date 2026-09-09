import type { ReactNode } from "react"
import { AdminCard } from "./AdminUi"

interface ListShellProps {
  // Encabezado de la página (AdminPageHeader).
  header: ReactNode
  // Barra de búsqueda / filtros. Opcional.
  toolbar?: ReactNode
  // Contenido scrolleable: la tabla o lista (más loader/error/empty).
  children: ReactNode
  // Paginación, fija al pie de la card. Opcional.
  pagination?: ReactNode
}

// Layout de "app" para las páginas de listado: el encabezado, la barra de
// filtros y la paginación quedan fijos; solo el cuerpo de la tabla scrollea.
// Requiere que el <main> del panel tenga altura fija (ver AdminLayout).
export const ListShell = ({
  header,
  toolbar,
  children,
  pagination,
}: ListShellProps) => (
  <div className="h-full flex flex-col">
    <div className="shrink-0">{header}</div>
    {toolbar && <div className="shrink-0">{toolbar}</div>}
    <AdminCard className="flex-1 min-h-0 flex flex-col">
      {/* scrollbar-gutter reserva el ancho de la barra: al aparecer/desaparecer
          no reflowea el contenido (evita el "saltito" al pasar el mouse). */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
        {children}
      </div>
      {pagination}
    </AdminCard>
  </div>
)
