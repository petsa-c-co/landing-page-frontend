import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { Client } from "../interfaces/client.interface"

// Incluye los inactivos, a diferencia del GET público.
export const getClientsAdminAction = async (): Promise<Client[]> => {
  const { data } = await petrogasApi.get<ApiEnvelope<Client[]>>("/clients/admin")
  return unwrap(data)
}

export interface ClientPayload {
  name: string
  // Key devuelta por POST /media/uploads.
  logoImage: string
  sortOrder?: number
  isActive?: boolean
}

export const createClientAction = async (
  payload: ClientPayload,
): Promise<Client> => {
  const { data } = await petrogasApi.post<ApiEnvelope<Client>>(
    "/clients",
    payload,
  )
  return unwrap(data)
}

export const updateClientAction = async (
  id: string,
  payload: Partial<ClientPayload>,
): Promise<Client> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<Client>>(
    `/clients/${id}`,
    payload,
  )
  return unwrap(data)
}

export const deleteClientAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/clients/${id}`)
}
