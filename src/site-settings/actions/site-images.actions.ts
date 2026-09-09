import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type {
  SiteImages,
  SiteImageSlot,
} from "../interfaces/site-images.interface"

// Público y cacheable (max-age=300). Solo trae los slots con imagen; sin nada
// cargado devuelve {} y cada página usa su imagen de reserva.
export const getSiteImagesAction = async (): Promise<SiteImages> => {
  const { data } = await petrogasApi.get<ApiEnvelope<SiteImages>>(
    "/site-settings/images",
  )
  return unwrap(data)
}

// imageKey es la key devuelta por POST /media/uploads; null limpia el slot.
// Devuelve el mapa completo ya actualizado, para refrescar el panel al toque
// sin esperar el caché del GET público.
export const updateSiteImageAction = async (
  slot: SiteImageSlot,
  imageKey: string | null,
): Promise<SiteImages> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<SiteImages>>(
    "/site-settings/images",
    { slot, imageKey },
  )
  return unwrap(data)
}
