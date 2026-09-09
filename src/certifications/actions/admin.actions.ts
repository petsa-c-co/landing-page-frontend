import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { Certification } from "../interfaces/certification.interface"

export interface CertificationPayload {
  // Código de la norma, ej: "ISO 9001:2015".
  title: string
  // Categoría corta, ej: "Calidad".
  subtitle: string
  description: string
  // La destacada se muestra en la banda aparte de la página pública.
  isFeatured?: boolean
  // Key devuelta por POST /media/uploads.
  logoImage?: string | null
  // Key devuelta por POST /media/documents (certificado en PDF, público).
  certificatePdf?: string | null
  sortOrder?: number
}

export const createCertificationAction = async (
  payload: CertificationPayload,
): Promise<Certification> => {
  const { data } = await petrogasApi.post<ApiEnvelope<Certification>>(
    "/certifications",
    payload,
  )
  return unwrap(data)
}

export const updateCertificationAction = async (
  id: string,
  payload: Partial<CertificationPayload>,
): Promise<Certification> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<Certification>>(
    `/certifications/${id}`,
    payload,
  )
  return unwrap(data)
}

export const deleteCertificationAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/certifications/${id}`)
}
