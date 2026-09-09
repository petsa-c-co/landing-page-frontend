import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { Service } from "../interfaces/service.interface"

export const getServicesAction = async (): Promise<Service[]> => {
  const { data } = await petrogasApi.get<ApiEnvelope<Service[]>>("/services")
  return unwrap(data)
}

export const getServiceBySlugAction = async (slug: string): Promise<Service> => {
  const { data } = await petrogasApi.get<ApiEnvelope<Service>>(
    `/services/${slug}`,
  )
  return unwrap(data)
}
