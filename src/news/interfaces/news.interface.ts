// Espeja la entidad NewsPost del backend.
export type NewsCategory = "novedades" | "prensa"

// De dónde salió la nota: carga manual en el panel o curaduría de LinkedIn.
export type NewsSource = "manual" | "linkedin"

export interface NewsPost {
  id: string
  title: string
  slug: string
  category: NewsCategory
  // Fecha visible de publicación (ISO).
  publishedAt: string | null
  // URL absoluta ya resuelta por el backend.
  coverImage: string | null
  excerpt: string
  // Cuerpo completo, para la página de detalle.
  body: string
  isFeatured: boolean
  isPublished: boolean
  // Origen de la nota: cargada a mano o importada desde LinkedIn.
  source: NewsSource
  // Link al post original cuando source es "linkedin".
  externalUrl: string | null
  // Fecha de envío a la papelera; solo llega con valor en /admin/trash.
  deletedAt: string | null
}

export interface NewsQueryParams {
  category?: NewsCategory
  featured?: boolean
  page?: number
  limit?: number
}
