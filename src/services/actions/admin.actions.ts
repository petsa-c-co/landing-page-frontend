import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type {
  Service,
  ServiceItemsLayout,
} from "../interfaces/service.interface"

// Incluye los inactivos, a diferencia del GET público.
export const getServicesAdminAction = async (): Promise<Service[]> => {
  const { data } = await petrogasApi.get<ApiEnvelope<Service[]>>(
    "/services/admin",
  )
  return unwrap(data)
}

export interface ServiceItemPayload {
  label: string
  spec?: string | null
  icon?: string | null
  sortOrder?: number
}

export interface ServicePayload {
  title: string
  slug?: string
  shortDescription: string
  longDescription: string
  // Keys devueltas por POST /media/uploads.
  cardImage?: string | null
  bannerImage?: string | null
  detailImage?: string | null
  itemsLayout?: ServiceItemsLayout
  sortOrder?: number
  isActive?: boolean
  // En PATCH reemplaza la lista completa de items.
  items?: ServiceItemPayload[]
}

export const createServiceAction = async (
  payload: ServicePayload,
): Promise<Service> => {
  const { data } = await petrogasApi.post<ApiEnvelope<Service>>(
    "/services",
    payload,
  )
  return unwrap(data)
}

export const updateServiceAction = async (
  id: string,
  payload: Partial<ServicePayload>,
): Promise<Service> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<Service>>(
    `/services/${id}`,
    payload,
  )
  return unwrap(data)
}

export const deleteServiceAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/services/${id}`)
}
