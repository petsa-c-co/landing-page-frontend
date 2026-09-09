import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { Certification } from "../interfaces/certification.interface"

export const getCertificationsAction = async (): Promise<Certification[]> => {
  const { data } =
    await petrogasApi.get<ApiEnvelope<Certification[]>>("/certifications")
  return unwrap(data)
}
