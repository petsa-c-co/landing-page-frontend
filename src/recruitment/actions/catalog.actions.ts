import { petrogasApi, unwrap, unwrapPaginated } from "@/api/petrogasApi"
import type { ApiEnvelope, Paginated } from "@/api/types"
import type {
  DegreeTitle,
  DegreeTitleLevel,
} from "../interfaces/recruitment.interface"

/**
 * ABM del catálogo de títulos. Es lo único de reclutamiento que sigue siendo
 * del sitio: los puestos y las postulaciones los administra Gestión Petrogas y
 * sus endpoints acá ya no existen.
 *
 * La tabla de gestión SÍ está paginada, a diferencia del endpoint público del
 * mismo recurso, que devuelve la lista entera para el autocompletado.
 */
export interface DegreeTitlesAdminParams {
  page?: number
  limit?: number
  search?: string
  level?: DegreeTitleLevel
}

export interface DegreeTitlePayload {
  name: string
  level: DegreeTitleLevel
  isActive?: boolean
  sortOrder?: number
}

export const getDegreeTitlesAdminAction = async (
  params: DegreeTitlesAdminParams = {},
): Promise<Paginated<DegreeTitle>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<DegreeTitle[]>>(
    "/recruitment/degree-titles/admin",
    { params: { page: 1, limit: 20, ...params } },
  )
  return unwrapPaginated(data)
}

export const createDegreeTitleAction = async (
  payload: DegreeTitlePayload,
): Promise<DegreeTitle> => {
  const { data } = await petrogasApi.post<ApiEnvelope<DegreeTitle>>(
    "/recruitment/degree-titles",
    payload,
  )
  return unwrap(data)
}

export const updateDegreeTitleAction = async (
  id: string,
  payload: Partial<DegreeTitlePayload>,
): Promise<DegreeTitle> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<DegreeTitle>>(
    `/recruitment/degree-titles/${id}`,
    payload,
  )
  return unwrap(data)
}

// Manda a la papelera (soft delete), no elimina.
export const deleteDegreeTitleAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/recruitment/degree-titles/${id}`)
}
