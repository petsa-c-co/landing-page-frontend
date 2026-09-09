import { useQuery } from "@tanstack/react-query"
import { getSiteSettingsAction } from "../actions/site-settings.actions"

export const SITE_SETTINGS_KEY = ["site-settings"] as const

// Lo consume el footer en todas las páginas. El backend ya lo sirve con
// max-age=300, así que no hace falta refetch agresivo de este lado.
export const useSiteSettings = () =>
  useQuery({
    queryKey: SITE_SETTINGS_KEY,
    queryFn: getSiteSettingsAction,
    staleTime: 5 * 60 * 1000,
  })
