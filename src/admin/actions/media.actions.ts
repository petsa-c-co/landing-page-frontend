import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024 // 4 MB, igual que el backend
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB, igual que el backend

export interface UploadedMedia {
  // Key que se manda al crear/editar la entidad (cardImage, coverImage, etc.).
  key: string
  // URL absoluta, para previsualizar en el panel.
  url: string
}

export const uploadImageAction = async (file: File): Promise<UploadedMedia> => {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await petrogasApi.post<ApiEnvelope<UploadedMedia>>(
    "/media/uploads",
    formData,
  )
  return unwrap(data)
}

// Solo sirve para limpiar archivos HUÉRFANOS (subidos y nunca asociados). Si
// la key ya la usa un servicio, certificación, cliente o novedad —incluso uno
// en la papelera— el backend responde 409: mostrar el mensaje y no reintentar.
// Borrar la imagen de una entidad se hace con su borrado definitivo, no acá.
export const deleteImageAction = async (key: string): Promise<void> => {
  await petrogasApi.delete("/media/uploads", { params: { key } })
}

// Endpoint aparte del de imágenes: solo acepta PDF (validado por magic bytes
// en el backend). Se usa para el certificado en PDF de las certificaciones.
export const uploadDocumentAction = async (
  file: File,
): Promise<UploadedMedia> => {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await petrogasApi.post<ApiEnvelope<UploadedMedia>>(
    "/media/documents",
    formData,
  )
  return unwrap(data)
}
