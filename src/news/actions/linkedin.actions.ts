import { petrogasApi, unwrap, unwrapPaginated } from "@/api/petrogasApi"
import type { ApiEnvelope, Paginated } from "@/api/types"
import type { NewsPost, NewsCategory } from "../interfaces/news.interface"
import type {
  LinkedInImport,
  LinkedInImportsQuery,
  LinkedInSyncResult,
} from "../interfaces/linkedin.interface"

// Trae los posteos recientes a la cola. Es idempotente: lo ya procesado no
// vuelve a aparecer. En modo 'api' sin credenciales el backend responde 503.
export const syncLinkedInAction = async (): Promise<LinkedInSyncResult> => {
  const { data } = await petrogasApi.post<ApiEnvelope<LinkedInSyncResult>>(
    "/news/linkedin/sync",
  )
  return unwrap(data)
}

// Cola de curaduría, paginada. Sin status el backend devuelve los pendientes.
export const getLinkedInImportsAction = async (
  params: LinkedInImportsQuery = {},
): Promise<Paginated<LinkedInImport>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<LinkedInImport[]>>(
    "/news/linkedin/imports",
    { params },
  )
  return unwrapPaginated(data)
}

export interface ApproveLinkedInPayload {
  // Catalogación obligatoria.
  category: NewsCategory
  isFeatured?: boolean
  // Si no se mandan, el backend los deriva del texto del posteo.
  title?: string
  excerpt?: string
}

// Crea y PUBLICA la nota. El slug se deriva del título y, si ya está tomado,
// el backend le agrega sufijo solo: nunca falla por duplicado.
export const approveLinkedInImportAction = async (
  id: string,
  payload: ApproveLinkedInPayload,
): Promise<NewsPost> => {
  const { data } = await petrogasApi.post<ApiEnvelope<NewsPost>>(
    `/news/linkedin/imports/${id}/approve`,
    payload,
  )
  return unwrap(data)
}

// Lo descarta: no se publica y no vuelve a la cola de pendientes.
export const rejectLinkedInImportAction = async (
  id: string,
): Promise<LinkedInImport> => {
  const { data } = await petrogasApi.post<ApiEnvelope<LinkedInImport>>(
    `/news/linkedin/imports/${id}/reject`,
  )
  return unwrap(data)
}
