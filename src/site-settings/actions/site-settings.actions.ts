import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type {
  SiteSettings,
  SiteSettingsPayload,
} from "../interfaces/site-settings.interface"

// Público y cacheable (max-age=300). Nunca da 404: si no hay datos cargados,
// devuelve los campos en null.
export const getSiteSettingsAction = async (): Promise<SiteSettings> => {
  const { data } = await petrogasApi.get<ApiEnvelope<SiteSettings>>(
    "/site-settings",
  )
  return unwrap(data)
}

// Devuelve la configuración ya actualizada, con la misma forma que el GET: se
// usa para refrescar el panel al instante, sin esperar los 5 min de caché.
export const updateSiteSettingsAction = async (
  payload: SiteSettingsPayload,
): Promise<SiteSettings> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<SiteSettings>>(
    "/site-settings",
    payload,
  )
  return unwrap(data)
}
