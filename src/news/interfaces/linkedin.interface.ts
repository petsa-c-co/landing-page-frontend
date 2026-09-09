// Espeja LinkedInImportEntity del backend: un candidato de la bandeja de
// curaduría. Es staging, NO es contenido público hasta que se aprueba.
export type LinkedInImportStatus = "pending" | "approved" | "rejected"

export interface LinkedInImport {
  id: string
  // URN del post en LinkedIn; el backend deduplica por acá.
  externalId: string
  status: LinkedInImportStatus
  // Permalink al post original.
  externalUrl: string
  text: string
  // Imagen del post, para previsualizar antes de aprobar.
  mediaUrl: string | null
  authorName: string | null
  postedAt: string | null
  // Nota creada al aprobar (null mientras está pendiente o si se rechazó).
  newsPostId: string | null
  reviewedAt: string | null
}

// Resultado de sincronizar con LinkedIn.
export interface LinkedInSyncResult {
  // Posteos traídos de la fuente.
  fetched: number
  // Cuántos eran nuevos y entraron a la cola.
  created: number
}

export interface LinkedInImportsQuery {
  status?: LinkedInImportStatus
  page?: number
  limit?: number
}
