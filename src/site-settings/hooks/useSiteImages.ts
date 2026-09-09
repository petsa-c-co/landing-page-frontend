import { useQuery } from "@tanstack/react-query"
import { useLoadableImage } from "@/lib/useLoadableImage"
import { getSiteImagesAction } from "../actions/site-images.actions"
import type { SiteImageSlot } from "../interfaces/site-images.interface"

export const SITE_IMAGES_KEY = ["site-settings", "images"] as const

// Lo consumen las cabeceras de todas las páginas fijas. El backend ya lo sirve
// con max-age=300, así que no hace falta refetch agresivo de este lado.
export const useSiteImages = () =>
  useQuery({
    queryKey: SITE_IMAGES_KEY,
    queryFn: getSiteImagesAction,
    staleTime: 5 * 60 * 1000,
  })

// Imagen cargada para el slot, o `fallback` (la del código) si todavía no hay
// ninguna. Devuelve undefined solo si tampoco hay reserva, y en ese caso quien
// llama muestra el fondo de reemplazo.
export const useSiteImage = (
  slot: SiteImageSlot,
  fallback?: string,
): string | undefined => {
  const { data } = useSiteImages()
  // Si la clave sigue viva pero el archivo ya no está, se trata igual que un
  // slot vacío: mejor la foto del código que un bloque en blanco.
  const loaded = useLoadableImage(data?.[slot])
  return loaded ?? fallback
}
