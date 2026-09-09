// Espeja las entidades Service / ServiceItem del backend.

// Cómo renderizar la lista de items; corresponde a los 3 diseños del sitio.
export type ServiceItemsLayout = "bullets" | "icons" | "numbered"

export interface ServiceItem {
  id: string
  label: string
  // Dato técnico del item (ej: "1440 ASME" en Well Testing).
  spec: string | null
  // Identificador de ícono que resuelve el frontend (ej: 'pickup', 'combi').
  icon: string | null
  sortOrder: number
}

export interface Service {
  id: string
  title: string
  slug: string
  // Para las cards del listado/index.
  shortDescription: string
  // Para la página propia del servicio.
  longDescription: string
  // URLs absolutas ya resueltas por el backend (null si no se cargó la imagen).
  cardImage: string | null
  bannerImage: string | null
  detailImage: string | null
  itemsLayout: ServiceItemsLayout
  sortOrder: number
  isActive: boolean
  items: ServiceItem[]
  // Fecha de envío a la papelera. Solo llega con valor en /admin/trash: en el
  // resto de los listados el backend excluye los borrados.
  deletedAt: string | null
}
