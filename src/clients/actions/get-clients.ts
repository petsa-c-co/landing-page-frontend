import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { Client } from "../interfaces/client.interface"

export const getClientsAction = async (): Promise<Client[]> => {
  const { data } = await petrogasApi.get<ApiEnvelope<Client[]>>("/clients")
  return unwrap(data)
}
